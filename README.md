# ClauseGuard: Hidden Trap Detector


[![Powered by Gemini 3.8 Flash](https://img.shields.io/badge/Powered%20by-Gemini%203.8%20Flash-orange?logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**ClauseGuard** is an AI-powered legal risk auditor and plain-English contract translator designed to bridge the access-to-justice gap. Built for the **PromptWars** hackathon, it empowers everyday consumers, students, and freelancers to understand complex agreements, spot hidden predatory clauses, and protect themselves before signing.

---

## Key Features

*  **Instant Document Ingestion:** Seamlessly upload dense legal PDFs (residential leases, freelance agreements, app terms of service).
*  **Traffic-Light Risk Stratification:** Automatically categorizes clauses into:
  *  **SAFE:** Standard, balanced terms.
  *  **CAUTION:** Ambiguous or slightly unfavorable provisions.
  *  **HIDDEN TRAP:** Predatory clauses, unfair penalties, automatic lock-ins, or hidden fees.
*  **Plain-English Translation:** Strips away dense legalese and translates complex legal obligations into clear, easily digestible explanations.
*  **Actionable Checklists:** Generates concrete next steps and questions to discuss before signing or negotiating a contract.

---

##  Tech Stack

* **AI Engine:** Google Gemini 1.5 Pro & Gemini 3.8 Flash (leveraging massive context windows for complete document analysis).
* **SDK:** Official `google-genai` Python library.
* **Frontend:** Streamlit for rapid, interactive UI deployment.
* **Hosting:** Streamlit Community Cloud & GitHub.

---

##  Local Installation & Setup

Follow these steps to run ClauseGuard locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Auroriadigitalforge/clauseguard.git](https://github.com/Auroriadigitalforge/clauseguard.git)
   cd clauseguard
