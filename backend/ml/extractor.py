import spacy
import re

nlp = spacy.load("en_core_web_md")

# ── Comprehensive 250+ skill taxonomy ──────────────────────────
SKILLS_TAXONOMY = [
    # Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
    "Ruby", "Swift", "Kotlin", "PHP", "Scala", "MATLAB", "Bash", "R",
    "Shell scripting", "PowerShell", "Dart", "Elixir", "Haskell",

    # Web Frontend
    "React", "Angular", "Vue.js", "Next.js", "Nuxt.js", "HTML", "CSS",
    "SASS", "Tailwind CSS", "Bootstrap", "jQuery", "Redux", "Webpack",
    "Vite", "Svelte", "Ember.js",

    # Backend & APIs
    "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot",
    "Laravel", "Ruby on Rails", "ASP.NET", "Microservices", "REST API",
    "GraphQL", "gRPC", "WebSockets", "API design", "REST",

    # Databases
    "SQL", "NoSQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Cassandra",
    "DynamoDB", "SQLite", "Elasticsearch", "Snowflake", "BigQuery",
    "Redshift", "Oracle", "SQL Server", "Databricks", "CouchDB",

    # Cloud & DevOps
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "GitLab CI", "CI/CD", "Helm", "ArgoCD",
    "Prometheus", "Grafana", "Linux", "Nginx", "Lambda", "EC2", "S3",
    "CloudFormation", "Serverless", "Pulumi", "Vagrant",

    # Data Engineering
    "Apache Spark", "Spark", "Kafka", "Apache Kafka", "Airflow",
    "Apache Airflow", "dbt", "Hadoop", "Flink", "Hive", "Presto",
    "Trino", "ETL", "ELT", "data pipelines", "data warehousing",
    "stream processing", "data modelling", "data governance",
    "data engineering", "Databricks", "Fivetran", "Stitch",

    # Machine Learning & AI
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "TensorFlow", "PyTorch", "scikit-learn", "Keras", "Hugging Face",
    "MLflow", "Kubeflow", "feature engineering", "model deployment",
    "A/B testing", "statistical modelling", "reinforcement learning",
    "transformers", "LLM", "RAG", "LangChain", "LlamaIndex",
    "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter",
    "OpenCV", "YOLO", "spaCy", "NLTK", "XGBoost", "LightGBM",
    "Stable Diffusion", "GPT", "BERT", "vector databases",
    "Pinecone", "Weaviate", "Chroma",

    # Analytics & BI
    "Tableau", "Power BI", "Looker", "Excel", "Google Analytics",
    "data analysis", "data visualisation", "business intelligence",
    "Metabase", "Superset", "Google Sheets", "Mixpanel", "Amplitude",

    # Blockchain & Web3
    "Solidity", "Ethereum", "Web3.js", "ethers.js", "smart contracts",
    "Smart Contracts", "DeFi", "NFT", "IPFS", "Hardhat", "Truffle",
    "Hardhat/Truffle", "Foundry", "Polygon", "Chainlink", "OpenZeppelin",
    "Layer 2", "zkEVM", "Solana", "Rust", "Anchor", "Web3",
    "blockchain", "Blockchain", "cryptocurrency", "MetaMask",
    "Uniswap", "ERC-20", "ERC-721", "DAO", "DApp",

    # Security
    "penetration testing", "OWASP", "SIEM", "network security",
    "incident response", "ISO 27001", "SOC 2", "zero trust",
    "SAST", "DAST", "vulnerability assessment", "firewalls",
    "cryptography", "PKI", "SSL/TLS", "SHA-256",

    # Mobile
    "React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin",
    "Xcode", "Firebase", "ARKit", "ARCore",

    # Embedded & IoT
    "Arduino", "Raspberry Pi", "ESP32", "RTOS", "C", "ARM",
    "IoT", "MQTT", "SCADA", "PLC programming", "Embedded systems",
    "FPGA", "Verilog", "VHDL",

    # Project & Product
    "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Trello",
    "project management", "product management", "stakeholder management",
    "Figma", "wireframing", "user research", "Notion", "Asana",

    # Operations & Industrial
    "SAP", "AutoCAD", "SolidWorks", "Six Sigma", "Lean", "Kaizen",
    "ISO 9001", "Safety protocols", "Equipment maintenance",
    "Predictive maintenance", "SCADA", "supply chain", "ERP",

    # Dev Tools
    "Git", "GitHub", "GitLab", "version control", "code review",
    "system design", "unit testing", "integration testing",
    "Selenium", "pytest", "Jest", "Cypress", "Postman",
    "Linux", "Bash", "debugging", "algorithms", "data structures",
]

# Deduplicate
_seen = set()
SKILLS_TAXONOMY = [s for s in SKILLS_TAXONOMY
                   if not (s.lower() in _seen or _seen.add(s.lower()))]

# Words that look like skills but are NOT — filter these out from NER
NER_BLOCKLIST = {
    "university", "college", "school", "institute", "academy",
    "bachelor", "master", "phd", "degree", "engineering", "science",
    "linkedin", "github", "twitter", "email", "phone",
    "experience", "education", "skills", "summary", "objective",
    "responsible", "worked", "developed", "created", "built",
    "managed", "led", "team", "company", "organization", "inc",
    "ltd", "pvt", "corp", "technologies", "solutions", "services",
    "internship", "project", "projects", "certification",
    "references", "hobbies", "interests", "profile", "overview",
}


def extract_skills(text: str) -> list:
    """
    Extract skills from text.
    Uses taxonomy matching (primary) + filtered spaCy NER (secondary).
    Filters out resume noise like college names, bullet points etc.
    """
    if not text or not text.strip():
        return []

    found = set()

    # Clean text — remove bullet points and special chars for better matching
    clean_text = re.sub(r'[•·▪▸►‣⦿●○◦]', ' ', text)
    clean_text = re.sub(r'\s+', ' ', clean_text)
    text_lower = clean_text.lower()

    # Primary: taxonomy matching
    for skill in SKILLS_TAXONOMY:
        skill_lower = skill.lower()
        if len(skill_lower) <= 2:
            if re.search(r'\b' + re.escape(skill_lower) + r'\b', text_lower):
                found.add(skill)
        else:
            if skill_lower in text_lower:
                found.add(skill)

    # Secondary: spaCy NER — ONLY for tech/product entities not in taxonomy
    try:
        doc = nlp(clean_text[:5000])
        for ent in doc.ents:
            if ent.label_ in ("PRODUCT",):   # Only PRODUCT, not ORG/GPE
                clean = ent.text.strip()
                clean_lower = clean.lower()
                # Skip if it's in blocklist or contains newlines/bullets
                if (2 < len(clean) < 30
                        and '\n' not in clean
                        and '•' not in clean
                        and '—' not in clean
                        and not any(b in clean_lower for b in NER_BLOCKLIST)
                        and not clean_lower.startswith(('•', '-', '*'))
                        and clean[0].isupper()):
                    found.add(clean)
    except Exception as e:
        print(f"[extractor] spaCy error: {e}")

    # Final cleanup — remove anything with newlines or bullet chars
    found = {s for s in found
             if '\n' not in s
             and '•' not in s
             and '—' not in s
             and len(s.strip()) > 1}

    return sorted(list(found))
