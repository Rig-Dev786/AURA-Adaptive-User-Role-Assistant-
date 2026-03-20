# 🌟 AURA — AI-Adaptive Onboarding Engine

> An intelligent, personalized learning pathway generator that eliminates redundant training and accelerates role-specific competency for new hires — powered entirely by a local NLP + ML pipeline with zero external LLM API calls.

---

## 📌 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [System Architecture](#system-architecture)
- [Skill-Gap Analysis Logic](#skill-gap-analysis-logic)
- [Adaptive Pathing Algorithm](#adaptive-pathing-algorithm)
- [Tech Stack](#tech-stack)
- [Datasets Used](#datasets-used)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running with Docker](#running-with-docker)
- [API Reference](#api-reference)
- [Demo Profiles](#demo-profiles)
- [Evaluation Criteria Mapping](#evaluation-criteria-mapping)
- [Team](#team)

---

## Problem Statement

Corporate onboarding today is static and impersonal. Experienced hires sit through content they already know; beginners get overwhelmed by advanced modules. Both outcomes waste time and reduce retention.

**AURA** solves this by dynamically generating a personalized learning roadmap for every new hire — grounded in their actual skill profile and the specific requirements of their role.

---

## Solution Overview

AURA takes two inputs:
1. A new hire's **resume** (PDF or DOCX)
2. A **job description** (plain text)

And produces:
- A **match score** (0–100%) showing current role readiness
- A **gap analysis** with severity scores for each missing skill
- A **personalized, ordered learning pathway** with course recommendations
- A **reasoning summary** explaining the pathway in plain English
- A **downloadable PDF report** of the full analysis

The system works across **both technical and non-technical roles** — demonstrated via two built-in demo profiles.

**Key differentiator:** AURA runs a fully local NLP + ML pipeline. No Gemini, no OpenAI, no Claude API. Every recommendation is produced by our own algorithm — making it reproducible, auditable, and hallucination-free.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                           │
│     Google OAuth Login   →   Upload Resume + Paste JD       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   FRONTEND (React 18 + Vite)                │
│                                                             │
│  UploadPanel → GapDisplay → PathwayCard → ReasoningPanel    │
│                    History page + PDF Export                │
└──────────────────────────────┬──────────────────────────────┘
                               │  POST /analyze (multipart)
                               │  Authorization: Bearer <token>
┌──────────────────────────────▼──────────────────────────────┐
│                       BACKEND (Flask)                       │
│                                                             │
│  Firebase token verify → parser.py (PDF/DOCX extraction)   │
│    → ml/extractor.py → ml/gap_scorer.py → ml/pathway.py    │
│              → Firestore save → JSON response              │
└──────────┬────────────────────────────────────┬────────────┘
           │                                    │
┌──────────▼──────────┐             ┌───────────▼────────────┐
│    ML PIPELINE      │             │   Firebase Services     │
│  (100% local)       │             │                         │
│                     │             │  Auth (Google OAuth)    │
│  spaCy NER +        │             │  Firestore (history)    │
│  Taxonomy matching  │             └────────────────────────┘
│         ↓           │
│  SentenceTransformer│
│  all-MiniLM-L6-v2   │
│         ↓           │
│  Cosine similarity  │
│  + rapidfuzz match  │
│         ↓           │
│  Severity sort →    │
│  Pathway order      │
└─────────────────────┘
```

---

## Skill-Gap Analysis Logic

The skill gap engine is entirely our own — no external LLM is involved at any stage.

### Step 1 — Text Extraction (`parser.py`)

The uploaded resume is parsed to plain text:
- **PDF** → PyMuPDF (`fitz.open()`)
- **DOCX** → `python-docx`

### Step 2 — Skill Extraction (`ml/extractor.py`)

Two complementary techniques are combined to maximize recall:

**a) spaCy NER** — `en_core_web_md` model identifies named entities from free text.

**b) Taxonomy Matching** — A curated list of ~200 known skills is keyword-matched against the extracted text.

```python
SKILLS_TAXONOMY = [
  "Python", "Java", "SQL", "NoSQL", "MongoDB", "PostgreSQL",
  "React", "Node.js", "Docker", "Kubernetes", "AWS", "GCP",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  "Spark", "Kafka", "Airflow", "dbt", "Tableau", "Power BI",
  "Git", "CI/CD", "REST API", "GraphQL", "Flask", "FastAPI",
  "Agile", "Scrum", "JIRA", "Excel", "SAP", "AutoCAD",
  "Six Sigma", "Lean", "Safety protocols", "Equipment maintenance",
  # ... 160+ more entries covering tech + operational domains
]

def extract_skills(text: str) -> list[str]:
    # 1. Run spaCy NER on text
    # 2. Keyword match against SKILLS_TAXONOMY
    # 3. Deduplicate and return clean skill list
```

### Step 3 — Gap Scoring (`ml/gap_scorer.py`)

For each skill required by the JD, we check if the resume covers it using fuzzy string matching:

```python
# rapidfuzz token sort ratio
best_match_score = max(
    rapidfuzz.fuzz.token_sort_ratio(jd_skill, r_skill)
    for r_skill in resume_skills
)

# Threshold: score < 75 → skill gap identified
if best_match_score < 75:
    gap_severity = round(1 - best_match_score / 100, 2)
```

For each confirmed gap, the **best matching course** is found using semantic embeddings:

```python
# sentence-transformers (all-MiniLM-L6-v2) — runs locally, no API
gap_embedding     = model.encode(gap_skill)
catalog_encodings = model.encode([c["skills_covered"] for c in catalog])

# Cosine similarity → pick highest scoring course
best_course = catalog[argmax(cosine_similarity(gap_embedding, catalog_encodings))]
```

### Step 4 — Match Score

```
matched     = number of JD skills with fuzzy score ≥ 75
match_score = round(matched / total_jd_skills × 100)
```

---

## Adaptive Pathing Algorithm

This is AURA's core original contribution. The pathway is **not** LLM-generated. It is a deterministic, severity-driven ordering algorithm.

### How It Works

1. All identified gaps are **sorted by `gap_severity` descending** — the biggest gaps come first in the learning pathway.

2. For each gap, the **semantically closest course** from `catalog.json` is assigned using cosine similarity on locally-run sentence-transformer embeddings.

3. Each course is annotated with a **`why` explanation** via a rule-based template engine:

```python
def generate_why(gap, index):
    severity = gap["gap_severity"]
    skill    = gap["skill"]
    if severity > 0.8:
        return f"{skill} is a critical gap for this role and not found in your resume. Start here first."
    elif severity > 0.5:
        return f"You have partial exposure to {skill}. This course will solidify your understanding."
    else:
        return f"You have some familiarity with {skill}. This course will close the remaining gap."
```

4. A **global reasoning summary** is generated via template string — fully deterministic, zero hallucination possible:

```python
def generate_reasoning(gaps):
    top3        = [g["skill"] for g in gaps[:3]]
    total_hours = sum(g["recommended_course"]["duration_hours"] for g in gaps)
    return (
        f"Your resume shows strong alignment in some areas, but the role "
        f"requires expertise in {', '.join(top3)}. "
        f"The pathway below addresses your {len(gaps)} skill gaps "
        f"in order of importance. Estimated total learning time: {total_hours} hours."
    )
```

### Why This Approach Wins

| Property | AURA's Algorithm | Naive LLM prompt |
|----------|-----------------|------------------|
| Hallucination risk | ✅ Zero — template-based output | ❌ High |
| Reproducibility | ✅ Deterministic results | ❌ Non-deterministic |
| Auditability | ✅ Every step inspectable | ❌ Black box |
| Grounding | ✅ Strict catalog-only recommendations | ❌ May invent courses |
| Speed | ✅ ~1–2 sec, fully local | ❌ Network round-trip latency |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite | UI framework |
| Styling | TailwindCSS | Component styling |
| Charts | Recharts | Match score radial bar + gap visualization |
| Routing | React Router v6 | 3-page app navigation |
| HTTP | Axios | API calls to Flask backend |
| PDF Export | jsPDF + html2canvas | Client-side PDF download |
| Auth (client) | Firebase Auth SDK | Google OAuth popup |
| Backend | Flask + flask-cors | REST API server |
| Auth (server) | firebase-admin SDK | Firebase token verification |
| Database | Firebase Firestore | Analysis history (NoSQL, free tier) |
| File parsing | PyMuPDF (`fitz`) | PDF text extraction |
| File parsing | python-docx | DOCX text extraction |
| NLP | spaCy `en_core_web_md` | Named entity recognition |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` | Semantic skill-to-course matching |
| Similarity | scikit-learn `cosine_similarity` | Course recommendation scoring |
| Fuzzy match | rapidfuzz | Skill string matching |
| PDF report | reportlab | Server-side PDF generation |
| Containerization | Docker | Reproducible backend deployment |

### ⚠️ No External LLM API
AURA's ML pipeline runs 100% locally. `spaCy` and `sentence-transformers` models are downloaded once at setup and run entirely on-device. There are no API keys, no rate limits, and no network dependency for the core analysis logic.

---

## Datasets Used

| Dataset | Source | Usage |
|---------|--------|-------|
| Resume Dataset | [Kaggle — snehaanbhawal](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset/data) | Validated skill extraction accuracy across resume formats |
| O*NET Database | [O*NET Resource Center](https://www.onetcenter.org/db_releases.html) | Role-to-skill mapping; informed our `SKILLS_TAXONOMY` list and catalog coverage |
| Jobs & Job Descriptions | [Kaggle — kshitizregmi](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description) | JD parser validation across technical and non-technical domains |

All datasets are publicly available and used strictly for non-commercial hackathon evaluation purposes.

---

## Project Structure

```
AURA/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx       # Resume + JD input form
│   │   │   ├── GapDisplay.jsx        # Three-column gap view + match score
│   │   │   ├── PathwayCard.jsx       # Numbered learning pathway steps
│   │   │   ├── ReasoningPanel.jsx    # Collapsible reasoning accordion
│   │   │   ├── HistoryList.jsx       # Past analyses list
│   │   │   └── Navbar.jsx            # Top navigation bar
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Google OAuth sign-in page
│   │   │   ├── Dashboard.jsx         # Main analysis page
│   │   │   └── History.jsx           # Saved analyses page
│   │   ├── firebase.js               # Firebase config + auth init
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── app.py                        # Flask app + all route definitions
│   ├── parser.py                     # PDF/DOCX → plain text extraction
│   ├── firestore_client.py           # Save/fetch analyses from Firestore
│   ├── catalog.json                  # 50 curated free courses
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── extractor.py              # spaCy NER + taxonomy skill extraction
│   │   ├── gap_scorer.py             # Gap scoring algorithm (no LLM)
│   │   └── pathway.py                # Pathway + reasoning builder (no LLM)
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
│
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Firebase project with **Google Authentication** and **Firestore** enabled
- `firebase-service-account.json` downloaded from Firebase Console → Project Settings → Service Accounts

> ⚠️ Never commit `firebase-service-account.json` to Git. Add it to `.gitignore` immediately.

### Backend

```bash
# Clone the repository
git clone https://github.com/your-team/aura.git
cd aura/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt

# Download spaCy language model (one-time, ~50MB)
python -m spacy download en_core_web_md

# Configure environment variables
cp .env.example .env
# Edit .env and set FIREBASE_SERVICE_ACCOUNT path

# Start the Flask development server
python app.py
# Runs at http://localhost:5000
```

### Frontend

```bash
cd aura/frontend

# Install Node dependencies
npm install

# Configure Firebase environment
cp .env.local.example .env.local
# Add your Firebase web config values to .env.local

# Start the Vite dev server
npm run dev
# Runs at http://localhost:5173
```

### Python Dependencies (`requirements.txt`)

```
flask
flask-cors
PyMuPDF
python-docx
spacy
sentence-transformers
scikit-learn
rapidfuzz
firebase-admin
reportlab
python-dotenv
```

---

## Running with Docker

```bash
cd aura/backend

# Build the Docker image
docker build -t aura-backend .

# Run the container
docker run -p 5000:5000 \
  -v $(pwd)/firebase-service-account.json:/app/firebase-service-account.json \
  aura-backend

# Backend available at http://localhost:5000
```

> The React frontend is run separately with `npm run dev` for the demo build.

---

## API Reference

Base URL: `http://localhost:5000`

Protected routes require: `Authorization: Bearer <firebase_id_token>`

---

### `GET /health`
Health check — no auth required.
```json
{ "status": "ok" }
```

---

### `POST /analyze`
Core analysis endpoint.

**Body:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `resume_file` | File (.pdf / .docx) | Candidate's resume |
| `jd_text` | string | Job description plain text |

**Response:**
```json
{
  "analysis_id": "abc123",
  "user_skills": ["Python", "SQL", "Git"],
  "jd_skills": ["Python", "Spark", "Kafka", "Docker"],
  "gaps": [
    {
      "skill": "Apache Spark",
      "gap_severity": 0.87,
      "recommended_course": {
        "id": "course_014",
        "title": "Intro to Apache Spark",
        "duration_hours": 4,
        "url": "https://kaggle.com/...",
        "skills_covered": "Spark, PySpark, DataFrames"
      },
      "reason": "Not found in resume"
    }
  ],
  "pathway": [
    {
      "order": 1,
      "course_id": "course_014",
      "title": "Intro to Apache Spark",
      "duration_hours": 4,
      "why": "Apache Spark is a critical gap for this role and not found in your resume. Start here first."
    }
  ],
  "reasoning": "Your Python and SQL skills are strong. The role needs distributed computing knowledge. Start with Spark, then move to Kafka.",
  "match_score": 43,
  "total_hours": 18
}
```

---

### `POST /save`
Save an analysis to Firestore.

**Body:** `{ "analysis_id": "abc123" }`

**Response:** `{ "saved": true }`

---

### `GET /history`
Get all saved analyses for the authenticated user.

**Response:**
```json
{
  "analyses": [
    {
      "analysis_id": "abc123",
      "created_at": "2025-03-20T10:30:00",
      "match_score": 43,
      "job_title_guess": "Data Engineer",
      "gap_count": 3
    }
  ]
}
```

---

### `GET /history/<analysis_id>`
Get one full saved analysis. Returns same shape as `/analyze`.

---

### `GET /report/<analysis_id>`
Download a PDF report.

**Response:** `Content-Type: application/pdf`

---

## Demo Profiles

Two one-click demo profiles are built into the frontend dashboard to demonstrate cross-domain generalization for judges.

### 🖥️ Profile 1 — Data Engineer (Technical Role)
- **Resume skills:** Python, SQL, Git, REST APIs, Django, PostgreSQL
- **JD requires:** Apache Spark, Kafka, Airflow, dbt, Docker, Kubernetes, AWS/GCP

### 🔧 Profile 2 — Field Operations Technician (Non-Technical Role)
- **Resume skills:** Equipment maintenance, safety protocols, MS Excel, basic troubleshooting
- **JD requires:** SAP ERP, IoT sensor management, predictive maintenance, Six Sigma, AutoCAD

Both profiles produce sensible, role-appropriate pathways from the same ML pipeline — demonstrating domain-agnostic generalization without any configuration changes.

---

## Evaluation Criteria Mapping

| Criterion | Weight | How AURA Addresses It |
|-----------|--------|-----------------------|
| Technical Sophistication | 20% | Local sentence-transformer embeddings + severity scoring via cosine similarity — real ML, not an API wrapper |
| Grounding & Reliability | 15% | All course recommendations strictly from `catalog.json`; `pathway.py` uses template strings — zero hallucination possible |
| Reasoning Trace | 10% | `generate_reasoning()` output displayed in `ReasoningPanel.jsx` with per-course `why` explanations |
| Product Impact | 10% | `match_score` + gap count + `total_hours` quantifies exact readiness gap and training investment |
| User Experience | 15% | Google OAuth login, analysis history, PDF export, Recharts visualizations, clean React UI |
| Cross-Domain Scalability | 10% | Two live demo profiles: Data Engineer (technical) + Field Operations Technician (non-technical) |
| Communication & Docs | 20% | This README + 5-slide deck + 2–3 min demo video walkthrough |

---

## Team

Built with ❤️ for the IISc Hackathon.

| Member | Role | Ownership |
|--------|------|-----------|
| Member A | Frontend — React UI | `frontend/` |
| Member B | Backend — Flask API + DevOps | `backend/app.py`, `parser.py`, `firestore_client.py`, `catalog.json`, `Dockerfile` |
| Member C | ML Pipeline | `backend/ml/` |

---

> *"Don't train everyone the same. Train everyone for what they actually need."*
