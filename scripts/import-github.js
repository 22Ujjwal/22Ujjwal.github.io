/**
 * import-github.js
 * Build-time script that fetches public GitHub repos for user "22Ujjwal"
 * and generates entity/edge/intent data for the knowledge graph.
 *
 * Run before build-index.js: node scripts/import-github.js
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const ENTITIES_DIR = join(DATA_DIR, 'entities');

const GITHUB_USER = '22Ujjwal';
const REPOS_API = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`;
const HEADERS = {
  'User-Agent': '22Ujjwal-portfolio-build',
  'Accept': 'application/vnd.github.v3+json'
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function fetchReadmeExcerpt(repoName) {
  try {
    const data = await fetchJSON(
      `https://api.github.com/repos/${GITHUB_USER}/${repoName}/readme`
    );
    if (data.content) {
      const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
      return decoded.slice(0, 500);
    }
  } catch {
    // README not available -- not critical
  }
  return '';
}

function extractSkills(repo) {
  const skills = new Set();
  if (repo.language) {
    skills.add(repo.language);
  }
  if (repo.topics && repo.topics.length > 0) {
    for (const topic of repo.topics) {
      skills.add(topic);
    }
  }
  return [...skills];
}

async function main() {
  console.log('[import-github] Fetching repos for', GITHUB_USER);

  let repos;
  try {
    repos = await fetchJSON(REPOS_API);
  } catch (err) {
    console.warn('[import-github] WARNING: Could not fetch repos from GitHub API.');
    console.warn('[import-github]', err.message);
    console.warn('[import-github] Skipping GitHub import -- build continues.');
    return;
  }

  // Filter: skip forks and repos without a description
  const filtered = repos.filter(r => !r.fork && r.description);
  console.log(`[import-github] Found ${filtered.length} repos (after filtering forks/no-description)`);

  // Build entity objects
  const entities = [];
  for (const repo of filtered) {
    const readmeExcerpt = await fetchReadmeExcerpt(repo.name);
    entities.push({
      id: `repo:${repo.name}`,
      type: 'repo',
      label: repo.name,
      properties: {
        description: repo.description,
        url: repo.html_url,
        language: repo.language || null,
        stars: repo.stargazers_count,
        topics: repo.topics || [],
        readme_excerpt: readmeExcerpt
      }
    });
  }

  // Ensure entities directory exists
  if (!existsSync(ENTITIES_DIR)) {
    await mkdir(ENTITIES_DIR, { recursive: true });
  }

  // Write repos.json (overwrite if exists)
  const reposPath = join(ENTITIES_DIR, 'repos.json');
  await writeFile(reposPath, JSON.stringify(entities, null, 2));
  console.log(`[import-github] Wrote ${entities.length} repo entities to data/entities/repos.json`);

  // Generate edges: each repo -> skills:all with relation "DEMONSTRATES"
  const repoEdges = entities.map(entity => ({
    from: entity.id,
    to: 'skills:all',
    relation: 'DEMONSTRATES',
    weight: 0.8,
    skills: extractSkills(
      filtered.find(r => `repo:${r.name}` === entity.id)
    )
  }));

  // Read existing edges.json, append repo edges, write back
  const edgesPath = join(DATA_DIR, 'edges.json');
  let existingEdges = [];
  try {
    const edgesRaw = await readFile(edgesPath, 'utf-8');
    existingEdges = JSON.parse(edgesRaw);
  } catch {
    // edges.json doesn't exist yet or is invalid
  }

  // Remove any previous repo edges (to avoid duplicates on re-run)
  const nonRepoEdges = existingEdges.filter(e => !e.from.startsWith('repo:'));
  const allEdges = [...nonRepoEdges, ...repoEdges];
  await writeFile(edgesPath, JSON.stringify(allEdges, null, 2));
  console.log(`[import-github] Updated data/edges.json with ${repoEdges.length} repo edges`);

  // Update intents.json: add "repos" intent pointing to all repo entity IDs
  const intentsPath = join(DATA_DIR, 'intents.json');
  let intents = {};
  try {
    const intentsRaw = await readFile(intentsPath, 'utf-8');
    intents = JSON.parse(intentsRaw);
  } catch {
    // intents.json doesn't exist yet or is invalid
  }

  intents.repos = entities.map(e => e.id);
  await writeFile(intentsPath, JSON.stringify(intents, null, 2));
  console.log(`[import-github] Updated data/intents.json with "repos" intent (${entities.length} IDs)`);

  console.log('[import-github] Done.');
}

main().catch(err => {
  console.error('[import-github] Fatal error:', err.message);
  // Don't crash the build -- exit cleanly
  process.exit(0);
});
