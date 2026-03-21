# 🌟 AURA — AI-Adaptive Onboarding Engine

> AURA is a local AI-powered system that generates personalized learning pathways by analyzing resumes against job descriptions — eliminating redundant training and accelerating role readiness.

---

## 🚀 Overview

AURA automates onboarding by identifying skill gaps and recommending a structured learning path.

**Inputs:**
- Resume (PDF/DOCX)
- Job Description (text)

**Outputs:**
- Match Score (0–100%)
- Skill Gap Analysis
- Personalized Learning Pathway
- Course Recommendations
- Downloadable PDF Report

---

## 🧠 Key Features

- Fully Local ML Pipeline — No external LLM APIs  
- Accurate Skill Gap Detection using NLP + fuzzy matching  
- Quantified Readiness Score  
- Deterministic Learning Pathway (No hallucinations)  
- Auto-generated PDF Reports  
- Firebase Authentication & History Tracking  

---

## 🏗️ Architecture

- Frontend: React + Vite + TailwindCSS  
- Backend: Flask (REST API)  
- ML Pipeline: spaCy + Sentence Transformers  
- Database: Firebase Firestore  
- Auth: Google OAuth  

---

## ⚙️ How It Works

1. Extract text from resume  
2. Identify skills using NLP + taxonomy matching  
3. Compare with job requirements (fuzzy matching)  
4. Compute skill gaps and severity  
5. Recommend courses using semantic similarity  
6. Generate ordered learning pathway  

---

## 🧰 Tech Stack

- React, TailwindCSS, Axios  
- Flask, Firebase Admin SDK  
- spaCy, Sentence Transformers  
- scikit-learn, rapidfuzz  
- PyMuPDF, python-docx  
- Docker  

---

## 📦 Setup

### Backend
```
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_md
python app.py
```

### Frontend
```
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker (Backend)

```
docker build -t aura-backend .
docker run -p 5000:5000 aura-backend
```

---

## 🔌 API

### POST /analyze
Analyzes resume + JD and returns:
- match_score  
- gaps  
- pathway  
- recommendations  

### GET /history
Fetch user analysis history  

---

## 📊 Use Cases

- Corporate onboarding optimization  
- Resume skill-gap analysis  
- Career roadmap generation  

---

## 🎯 Key Advantage

Unlike LLM-based systems, AURA is:
- Deterministic  
- Explainable  
- Fast (~1–2s)  
- Offline-capable  

---

## 👥 Team

Built for hackathon innovation.

---

## 💡 Vision

Train people based on what they lack, not what they already know.
