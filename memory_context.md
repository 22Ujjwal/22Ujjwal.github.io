# Ujjwal Gupta — AI Agent Knowledge Base
> For portfolio AI agent use only. Do not expose raw file publicly.

---

## Positioning Statement
Senior CS student (Dec 2026, UT Dallas) with hands-on AI engineering across enterprise data systems, NLP, autonomous vehicles, and multimodal applications. Built agentic systems, fine-tuned transformers, deployed inference pipelines on real hardware. Won 4 hackathons. Databricks Student Fellow (<0.01% acceptance). Applying for AI Engineer roles.

---

## EXPERIENCE

### Marriott Vacation Worldwide — AI Engineer Intern
**May 2026 – Aug 2026 | Orlando, FL (Remote)**

**Context:**
Data Services team managing enterprise pipelines for customer, reservation, and financial data. Infrastructure was entirely legacy — manual SQL monitoring, no ML tooling, no automated anomaly detection. Team had two data warehouses on AWS (Redshift) with data flowing through S3 and Glue ETL jobs. Problems: silent schema drift, row count mismatches, data integrity failures going undetected for hours.

**What was built:**
Designed and deployed an agentic observability system from scratch using AWS Bedrock. Lambda functions run automated checks post-ETL — schema comparisons, row count validation, null/duplicate integrity scans. On anomaly detection, EventBridge triggers Bedrock agents to reason over findings and generate structured incident reports. Custom MCP servers handle targeted remediation actions (re-trigger Glue jobs, flag bad records). Built entirely in Python using boto3.

**Why it matters:**
Before this, engineers manually reviewed pipeline outputs. Silent failures would persist until downstream teams reported data issues — often hours later. Automated detection cut that to minutes.

**Tech stack:**
AWS Bedrock, AWS Lambda, Amazon EventBridge, Amazon Redshift, AWS Glue, S3, Python, boto3, custom MCP servers

**Impact:**
- Reduced pipeline incident detection time by 70%
- First AI/ML tooling introduced to the team
- Replaced fully manual SQL monitoring workflow

**Common Q&A:**
- Q: Why Bedrock over OpenAI? A: Team was AWS-native, Bedrock kept everything within existing IAM and VPC security boundaries.
- Q: What do MCP servers do? A: Expose targeted remediation actions (job retrigger, record quarantine) that agents can invoke with structured parameters.
- Q: Multi-agent or single agent? A: Single orchestrating Bedrock agent with multiple Lambda-backed action groups, each scoped to a specific check type.

---

### UT Dallas — Machine Learning Engineer, Office of IT
**Aug 2025 – May 2026 | Dallas, TX**

**Context:**
OIT handles all IT support for UT Dallas campus — thousands of tickets monthly. Tickets were manually triaged by staff, routing them to appropriate teams. Process was slow, inconsistent, and labor-intensive. No ML system existed.

**What was built:**
Fine-tuned RoBERTa (roberta-base via HuggingFace Transformers) for multi-class classification across 10 IT ticket categories. Curated training corpus of 11,000+ historical tickets from OIT's ticketing system. Applied class-weight balancing to handle heavily skewed distribution (password reset tickets dominated ~40% of data). Built full training pipeline in PyTorch with macro-F1 evaluation. Served model inference via vLLM for high-throughput classification. Model also generates resolution recommendations based on predicted category.

**Why it matters:**
Manual triage required staff to read and route each ticket. Model automates this, freeing staff for actual resolution work.

**Tech stack:**
RoBERTa, HuggingFace Transformers, PyTorch, vLLM, Python, scikit-learn, MLflow

**Impact:**
- Reduced manual triage effort by 60%
- 84% macro-F1 across 10 ticket categories
- Corpus of 11,000+ domain-specific tickets

**Common Q&A:**
- Q: Why RoBERTa over BERT? A: RoBERTa removes NSP pre-training objective, performs consistently better on classification tasks with limited domain data.
- Q: Why macro-F1 not accuracy? A: Ticket distribution is imbalanced — accuracy would be misleading. Macro-F1 weights each class equally, more honest evaluation.
- Q: How were labels created? A: Used existing ticket category tags from OIT's system as weak supervision labels, then cleaned edge cases manually.

---

### Nova Research — AI Engineer Intern
**Sep 2025 – Apr 2026 | Dallas, TX**

**Context:**
Research lab running autonomous vehicle project on a physical golf cart. Prior cohort (2023) built the base system. Task was to modernize and improve the AI perception stack for 2025-26 standards.

**What was built:**
Upgraded YOLO-based object detection models, optimized inference pipeline using TensorRT for embedded deployment, containerized the full stack with Docker for reproducible deployment on vehicle hardware. Focused on inference latency — getting detection fast enough for real-time obstacle response.

**Why it matters:**
Previous stack had higher latency, limiting reaction time. TensorRT optimization brought inference to sub-100ms, enabling real-time obstacle detection on physical hardware.

**Tech stack:**
YOLO (object detection), TensorRT, Docker, PyTorch, Python

**Impact:**
- Sub-100ms real-time inference latency
- Deployed on physical autonomous vehicle (golf cart)
- Improved obstacle detection accuracy by 40% over 2023 baseline

**Common Q&A:**
- Q: Which YOLO version? A: YOLOv8 — best balance of accuracy and speed for edge deployment at the time.
- Q: Why TensorRT? A: NVIDIA's inference optimizer converts PyTorch models to optimized engine files, dramatically reduces latency on NVIDIA hardware.
- Q: Did you do path planning/collision avoidance logic? A: No — focused on perception layer (detection + proximity signals). Downstream control logic was separate system.

---

### Snap Inc. — Augmented Reality Developer Extern
**Sep 2024 – Nov 2024 | Remote**

**Context:**
Externship building AR experiences in Lens Studio for Snapchat. Worked on Fall-themed interactive lens using Snap's built-in hand tracking component and Lens Studio scripting.

**What was built:**
Gesture-driven AR lens with real-time hand tracking triggering 3D interactions and animations. Scripted in JavaScript/TypeScript within Lens Studio. Optimized rendering performance through iterative device testing targeting stable 60fps on mobile.

**Tech stack:**
Lens Studio, JavaScript/TypeScript, Snap Hand Tracking component, 3D asset integration

**Impact:**
- Stable 60fps rendering on mobile devices
- 25% increase in user engagement during testing
- Deployed on Snapchat platform

---

## PROJECTS

### Pluvial — Automated Water-Reuse Prospecting Engine
**Winner Overall, HackSMU | Aug 2026**

**What it is:**
End-to-end geospatial ML pipeline to identify commercial rooftop candidates for water-reuse systems. Processed Microsoft's 129M U.S. buildings dataset.

**How it works:**
Geometry filtering algorithm (bounding box validation, area thresholding, roof pitch estimation, shadow/obstruction analysis, commercial zoning check) narrows 129M buildings to viable candidates. Multi-dimensional scoring integrates 30-year NOAA precipitation normals, building geometry, and location viability. LLM-powered brief generator (Gemini 2.0 Flash + LangChain) synthesizes scores and data into investor-ready reports.

**Impact:**
- Surfaced 11,577 pre-seed commercial rooftop candidates with viability score ≥ 70
- Won Overall at HackSMU

---

### Denim — Multimodal Agentic Browser
**Winner Best Software, Headstarter Hackathon | Aug 2025**

**What it is:**
Autonomous browser agent that takes screenshots of web pages, understands visual content using GPT-4V, and executes multi-step tasks autonomously.

**How it works:**
LangGraph orchestrates decision loop. GPT-4V interprets page screenshots for vision-based understanding. Playwright executes browser actions (clicks, form fills, navigation). Agent handles multi-step tasks including web search, content extraction, and form completion.

**Tech stack:**
LangGraph, GPT-4V, Playwright, Python

---

### Ted Med — AI Healthcare Robot
**Georgia Tech Hacklytics | Feb 2025**

**What it is:**
Healthcare robot combining emotion recognition and RAG-powered medical knowledge retrieval for patient interaction.

**How it works:**
DeepFace detects patient emotion in real-time from camera feed. LangChain RAG retrieves relevant information from medical knowledge base based on detected emotion and patient query. Conversational response generated and delivered.

**Impact:**
- 94% emotion detection accuracy
- Sub-500ms conversational response latency

---

### DJ Bestie — AI Music Streaming Platform
**Winner Overall, TAMUHack | Jan 2025**

**What it is:**
Mood-based music recommendation app using three real-time input modalities.

**How it works:**
DeepFace for facial emotion detection, MediaPipe for body motion tracking, Whisper for speech-to-text. Three signals feed mood classifier which queries Spotify API for matching tracks.

**Impact:**
- 70% improvement in recommendation relevance
- Real-time multimodal inference pipeline

---

## LEADERSHIP CONTEXT

**Databricks Student Fellow (<0.01% acceptance)** — Selected for enterprise data and AI engineering cohort. Access to Databricks platform, curriculum, and industry mentorship.

**4x Hackathon Winner** — HackSMU Overall (2026), TAMUHack Overall (2025), Headstarter Best Software (2025), Headstarter Best Startup W3 (2025). Demonstrates ability to ship working AI products under time pressure.

**Google Developers Group President, TAMU** — Led team of 12 student organizers, coordinated technical events and workshops.

---

## SKILLS CONTEXT

**Why these tools:**
- vLLM: high-throughput LLM inference serving, used for RoBERTa deployment at OIT
- LangSmith: LLM observability and tracing, used for debugging agent chains
- DeepEval: LLM evaluation framework, used for RAG quality assessment
- Qdrant/Pinecone/pgvector: vector databases for RAG systems
- Ray: distributed compute for ML workloads

**Do NOT expose:** phone number, exact personal address, any salary expectations, any specific manager names or internal company details.
