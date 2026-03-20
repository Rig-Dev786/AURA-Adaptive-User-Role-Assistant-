# AURA — Skill Extractor
# Owner: Member C

import spacy

# Load once at module level — never inside the function
nlp = spacy.load("en_core_web_md")

SKILLS_TAXONOMY = [
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
    "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Cassandra",
    "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "FastAPI",
    "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
    "AWS", "GCP", "Azure", "S3", "EC2", "Lambda", "Cloud Functions",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "TensorFlow", "PyTorch", "scikit-learn", "Keras", "Hugging Face",
    "Apache Spark", "Kafka", "Airflow", "dbt", "Hadoop", "Flink",
    "Tableau", "Power BI", "Looker", "Excel", "Google Sheets",
    "Git", "CI/CD", "REST API", "GraphQL", "gRPC", "Microservices",
    "Agile", "Scrum", "Kanban", "JIRA", "Confluence",
    "SAP", "AutoCAD", "SolidWorks", "MATLAB",
    "Six Sigma", "Lean", "Kaizen", "ISO 9001",
    "Safety protocols", "Equipment maintenance", "Predictive maintenance",
    "IoT", "SCADA", "PLC programming", "Embedded systems",
    "Data analysis", "Statistical modeling", "A/B testing",
    "Project management", "Stakeholder management", "Communication",
    "Leadership", "Problem solving", "Critical thinking",
    # Add more to reach 200 entries
]

def extract_skills(text: str) -> list[str]:
    """
    Extract skills from text using:
    1. spaCy NER — catches skills mentioned as named entities
    2. Taxonomy matching — catches skills from our curated list
    Returns deduplicated list of skill strings.
    """
    found = set()

    # spaCy NER pass
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ in ("ORG", "PRODUCT", "GPE", "WORK_OF_ART"):
            found.add(ent.text.strip())

    # Taxonomy keyword match
    text_lower = text.lower()
    for skill in SKILLS_TAXONOMY:
        if skill.lower() in text_lower:
            found.add(skill)

    return sorted(list(found))
