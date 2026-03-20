# 🗺️ Developer Roadmaps Data

This repository contains a collection of developer roadmaps, automatically scraped and downloaded from the official [roadmap.sh](https://roadmap.sh/) GitHub repository. 

## 📂 What's Inside?
* `All_Roadmap_Files/`: This folder contains 70+ individual Markdown (`.md`) files. Each file represents a specific tech domain (e.g., Python, Backend, DevOps, Machine Learning) and includes the raw data and guide text for that roadmap.
* `scraper.py`: The Python script used to automatically fetch and update these files via the GitHub API.

## 🚀 How to Update the Data
If new roadmaps are added to roadmap.sh, you can easily update this repository by running the included Python script. 

1. Ensure you have Python installed.
2. Install the required `requests` library:
   ```bash
   pip install requests
3. Run the scraper:

```bash
    python3 scraper.py


The script will automatically check the GitHub API for any new or updated domains and download the latest .md files directly into the All_Roadmap_Files folder.

⚖️ Credits
All roadmap content belongs to Kamran Ahmed and the contributors at the developer-roadmap repository. This repository was created strictly for personal data extraction, automation practice, and learning purposes. 
