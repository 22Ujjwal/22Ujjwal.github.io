import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@vercel/kv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY environment variable');
  process.exit(1);
}
if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  console.error('Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variable');
  process.exit(1);
}

const kv = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

// --- Read data files ---

function readJSON(relativePath) {
  const fullPath = join(ROOT, relativePath);
  const raw = readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

function loadEntities() {
  console.log('Reading entity files...');

  const person = readJSON('data/entities/person.json');
  const experiences = readJSON('data/entities/experiences.json');
  const projects = readJSON('data/entities/projects.json');
  const education = readJSON('data/entities/education.json');
  const skills = readJSON('data/entities/skills.json');
  const leadership = readJSON('data/entities/leadership.json');

  // Normalize everything into a flat array of entities
  const entities = [];

  // Person is a single object
  entities.push({ ...person, _type: 'person' });

  // Arrays
  for (const e of experiences) entities.push({ ...e, _type: 'experience' });
  for (const p of projects) entities.push({ ...p, _type: 'project' });
  for (const ed of education) entities.push({ ...ed, _type: 'education' });
  for (const l of leadership) entities.push({ ...l, _type: 'leadership' });

  // Skills is a single object
  entities.push({ ...skills, _type: 'skills' });

  console.log(`Loaded ${entities.length} entities`);
  return entities;
}

// --- Text representation for embedding ---

function entityToText(entity) {
  switch (entity._type) {
    case 'person': {
      const props = entity.properties || {};
      return `${props.name || entity.label}. ${props.headline || ''}. ${props.summary || ''}`.trim();
    }
    case 'experience': {
      const props = entity.properties || {};
      const highlights = (props.highlights || []).join('. ');
      return `Work experience: ${props.position || entity.label} at ${props.company || ''} (${props.duration || ''}). ${highlights}`.trim();
    }
    case 'project': {
      const props = entity.properties || {};
      const tech = (props.tech || props.technologies || []).join(', ');
      return `Project: ${entity.label}. ${props.description || ''}. Technologies: ${tech}. Achievement: ${props.achievement || ''}`.trim();
    }
    case 'education': {
      const props = entity.properties || {};
      const activities = props.activities ? `. ${props.activities}` : '';
      return `${props.institution || entity.label}. ${props.degree || ''}${activities}`.trim();
    }
    case 'skills': {
      const props = entity.properties || {};
      const aiMl = (props.ai_ml || []).join(', ');
      const dataCloud = (props.data_cloud || []).join(', ');
      const programming = (props.programming || []).join(', ');
      const infrastructure = (props.infrastructure || []).join(', ');
      return `Technical skills: AI/ML: ${aiMl}. Data & Cloud: ${dataCloud}. Programming: ${programming}. Infrastructure: ${infrastructure}`.trim();
    }
    case 'leadership': {
      const props = entity.properties || {};
      const achievement = props.achievement ? `. ${props.achievement}` : '';
      return `${props.position || entity.label} at ${props.organization || ''} (${props.duration || ''})${achievement}`.trim();
    }
    default:
      return entity.label || entity.id || '';
  }
}

// --- Gemini batch embedding ---

async function batchEmbed(texts) {
  console.log(`Embedding ${texts.length} texts via Gemini text-embedding-004...`);

  const BATCH_SIZE = 100;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const requests = batch.map((text) => ({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini embedding API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const embeddings = data.embeddings.map((e) => e.values);
    allEmbeddings.push(...embeddings);

    console.log(`  Embedded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}`);
  }

  return allEmbeddings;
}

// --- Store in Vercel KV ---

async function storeInKV(entities, embeddings, edges, intents) {
  console.log('Storing data in Vercel KV...');

  // Store each entity with its embedding
  const embeddingIndex = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const embedding = embeddings[i];
    const id = entity.id;

    // Remove internal _type field before storing
    const { _type, ...entityData } = entity;

    const value = { ...entityData, embedding };
    await kv.set(`entity:${id}`, JSON.stringify(value));
    embeddingIndex.push([id, embedding]);

    console.log(`  Stored entity:${id}`);
  }

  // Store embedding index
  await kv.set('embedding_index', JSON.stringify(embeddingIndex));
  console.log(`  Stored embedding_index (${embeddingIndex.length} entries)`);

  // Store edges
  await kv.set('edges', JSON.stringify(edges));
  console.log(`  Stored edges (${edges.length} entries)`);

  // Store intents
  await kv.set('intents', JSON.stringify(intents));
  console.log(`  Stored intents`);
}

// --- Main ---

async function main() {
  console.log('=== Build Index: Starting ===\n');

  // 1. Load entities
  const entities = loadEntities();

  // 2. Load edges
  console.log('Reading edges.json...');
  const edges = readJSON('data/edges.json');
  console.log(`Loaded ${edges.length} edges`);

  // 3. Load intents
  console.log('Reading intents.json...');
  const intents = readJSON('data/intents.json');
  console.log(`Loaded intents (${Object.keys(intents).length} intent types)`);

  // 4. Generate text representations
  console.log('\nGenerating text representations...');
  const texts = entities.map((e) => entityToText(e));
  for (let i = 0; i < entities.length; i++) {
    console.log(`  [${entities[i].id}]: "${texts[i].slice(0, 80)}..."`);
  }

  // 5. Batch embed
  console.log('');
  const embeddings = await batchEmbed(texts);
  console.log(`Received ${embeddings.length} embeddings (dim=${embeddings[0].length})\n`);

  // 6. Store in KV
  await storeInKV(entities, embeddings, edges, intents);

  console.log('\n=== Build Index: Complete ===');
}

main().catch((err) => {
  console.error('Build index failed:', err);
  process.exit(1);
});
