# ClauseGuard — Legal Risk Auditor & Plain-English Contract Translator

[![Powered by Gemini 3.8 Flash](https://img.shields.io/badge/Powered%20by-Gemini%203.8%20Flash-orange?logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **ClauseGuard** audits legal agreements, exposes hidden traps and predatory liabilities, translates complex legalese into plain English, and provides counter-proposal language and attorney consultation frameworks.

---

## Overview

Contracts, terms of service, and lease agreements are frequently stacked against consumers, renters, and independent workers through unilateral indemnities, automatic renewal traps, and aggressive liability disclaimers. 

ClauseGuard serves as an automated contract co-pilot that:
1. Scans legal syntax and identifies one-sided or unconscionable clauses.
2. Computes an objective **Fairness Score (0–100)** with categorized risk ratings.
3. Translates legalese into plain-English explanations of real-world exposure.
4. Supplies ready-to-use redline counter-language and negotiation emails.
5. Equips users with an **"Ask a Lawyer" consultation prep framework** to maximize 15-minute consultations with real attorneys.
6. Exports professional, multi-page printable PDF audit reports.

---

## Challenge Submission Details

### 1. Chosen Vertical & Persona
- **Vertical**: **Legal Tech & Consumer Rights Protection**
- **Target Personas**: Everyday consumers, residential tenants, independent contractors / freelancers, students, and small business operators.
- **Why this Vertical**: Standard-form "contracts of adhesion" represent one of the most asymmetrical power imbalances in modern society. Over 90% of signers never read terms of service or apartment leases due to impenetrable legalese, yet bear severe financial liabilities when disputes arise. ClauseGuard levels this playing field by turning passive signers into empowered negotiators.

### 2. Approach and Logic
ClauseGuard operates on a multi-stage cognitive pipeline designed for high accuracy and defensible analysis:
1. **Document Ingestion & Multi-Format Parsing**:
   - Accepts raw text, PDF, `.docx`, `.md`, or pre-configured test agreements.
   - Extracts plain text client-side or streams binary documents directly to the backend Gemini model for OCR and layout-aware processing.
2. **Contextual Persona Conditioning**:
   - The user selects an **Audit Perspective** (e.g., *Residential Tenant*, *Freelancer*, *Consumer*, *Small Business*).
   - The evaluation rubric dynamically shifts its risk sensitivity: an IP assignment clause is benign for a residential tenant but critical for a software freelancer; an automatic evergreen renewal is fatal for a short-term renter.
3. **Dual Analysis Engine**:
   - **Primary AI Engine**: Server-side Google Gemini Flash with strict JSON Schema output. Extracts clauses, categorizes risks (Hidden Trap, Caution, Standard), writes plain-English explanations, and drafts redline revisions.
   - **Offline Heuristic Engine**: A deterministic regex and pattern-matching backup engine (`heuristicAuditor.ts`) that runs locally if API quotas are exceeded or when testing offline, guaranteeing zero-downtime reliability.
4. **Fairness Scoring Metric (0–100)**:
   - Starts at 100 and applies weighted deductions:
     - 🔴 **Hidden Traps** (Predatory/Uncapped): -18 points each
     - 🟡 **Cautions** (One-sided/Ambiguous): -8 points each
     - 🟢 **Standard Terms**: 0 deductions
   - Normalized into clear qualitative tiers: *Fair & Balanced* (80-100), *Moderate Caution* (60-79), *High Risk* (40-59), and *Predatory / Critical Risk* (<40).
5. **Actionable Empowerment Outputs**:
   - Generates redlines, interactive pre-signing checklists, non-confrontational counter-proposal emails, an "Ask a Lawyer" consultation prep sheet, and downloadable multi-page PDF reports.

### 3. How the Solution Works
1. **Upload or Paste**: User uploads a document or chooses from pre-loaded real-world sample contracts (Freelance Master Services Agreement, Apartment Lease, or Software SaaS Terms).
2. **Instant Scan**: In seconds, the application decomposes the contract into atomic clauses and computes the fairness breakdown.
3. **Side-by-Side Review**: Users review original clauses side-by-side with plain-English translations and recommended counter-amendments.
4. **Prepare for Counsel or Counterparty**:
   - Launch **"Ask a Lawyer"** to simulate an attorney prep session with focused questions, legal doctrines, and an evidence checklist.
   - Generate a customized, courteous negotiation email ready to send to the counterparty.
   - Download a client-side compiled PDF memorandum.

### 4. Assumptions Made
- **Informational & Educational Scope**: The assistant explicitly acts as a document preparation and education tool, **not** formal legal representation. All outputs carry prominent statutory disclaimers.
- **Common Law Baseline**: Unless a specific jurisdiction is explicitly parsed in governing law clauses, evaluation logic defaults to widely adopted US/Commonwealth common-law contract principles (e.g., unconscionability, mutual consideration, duty of good faith).
- **Security & Privacy**: Zero long-term document retention on external servers. Documents are processed in-memory and ephemeral sessions, preventing private contract data leakage.

---

## Key Features

### 1. Document Upload & Multi-Audience Profiling
- **Flexible Input**: Upload contracts as PDF, Word documents (`.docx`), text files (`.txt`), or paste text directly.
- **Pre-Loaded Sample Contracts**: Includes pre-built test templates:
  - *Freelance Master Services Agreement* (unilateral IP assignment, uncapped liability)
  - *Apartment Residential Lease* (automatic renewal, security deposit forfeiture)
  - *Software SaaS Terms of Service* (unilateral terms modification, class action waiver)
- **Target Audience Tailoring**: Customizes risk evaluation based on persona:
  - Consumer
  - Freelancer / Independent Contractor
  - Residential Tenant
  - Student / Employee
  - Small Business Operator

### 2. Deep Clause Risk Audit
- **Risk Classification**:
  -  **Hidden Traps**: Critical financial exposure, predatory liquidated damages, automatic evergreen renewals, unilateral IP transfers.
  -  **Cautions**: One-sided notice periods, broad confidentiality exclusions, foreign governing jurisdictions.
  -  **Standard / Balanced**: Reciprocal notice, standard force majeure, mutual non-disclosure terms.
- **Side-by-Side Analysis**: Each clause card displays:
  - Original contract snippet
  - Plain-English translation
  - Potential risk & real-world liability breakdown
  - Recommended counter-proposal revision (one-click copy)

### 3. "Ask a Lawyer" Consultation Prep Assistant
- **Educational Simulation**: Mimics a legal consultation Q&A interaction with clear disclaimers that the tool does not provide formal legal advice.
- **Targeted Attorney Inquiries**: Automatically generates probing questions for each flagged clause:
  - *Questions a lawyer will ask you* (baseline commercial understanding, verbal promises, insurance coverage).
  - *Questions to propose to the counterparty* (mutuality, notice-and-cure periods, liability caps).
  - *Key legal issues and common law doctrines* (unconscionability, *contra proferentem*, statutory automatic renewal rules).
  - *Evidence checklist* of documents and communication records to bring to counsel.
- **Exportable Prep Sheet**: One-click export of an attorney consultation agenda to bring to meetings or consultation calls.

### 4. Printable PDF Audit Report
- **Client-Side PDF Compilation**: Built with `jsPDF` to generate clean, letter-sized printable audit reports.
- **Memorandum Layout**:
  - Executive header and document classification
  - Overall fairness score and metric gauges
  - Detailed clause-by-clause audit with color-coded risk pills
  - Actionable pre-signing checklist with checkboxes
  - Legal glossary appendix and statutory disclaimer
  - Automated page pagination (`Page X of Y`) and running header banners

### 5. Interactive Legal Glossary
- **Context-Sensitive Explanations**: Searchable and expandable database of complex legal terms (e.g., *Indemnification*, *Liquidated Damages*, *Severability*, *Force Majeure*, *Subrogation*, *Governing Law*).
- **Practical Negotiation Advice**: Offers actionable tips on how to negotiate or soften each specific legal mechanism.

### 6. Polite Negotiation Email Generator
- Generates professional, non-confrontational counter-proposal correspondence ready to send to landlords, clients, or counterparty counsel.
- Customizes salutations and embeds specific requested modifications with side-by-side justification.

### 7. Dual Engine Architecture (Gemini AI + Fallback Heuristics)
- **Primary AI Engine**: Powered by Google's Gemini models (`@google/genai`) with structured JSON schema output for rigorous analysis.
- **Resilient Fallback**: Includes an offline heuristic regex audit engine that automatically activates if network limits or API constraints occur.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Modern, type-safe reactive UI |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Lightning-fast HMR and production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Responsive design with typography and custom components |
| **Icons** | [Lucide React](https://lucide.dev/) | High-contrast vector icons |
| **Document Export**| [jsPDF](https://github.com/parallax/jsPDF) | Client-side multi-page legal memorandum generator |
| **Backend API** | [Express 4](https://expressjs.com/) + [tsx](https://github.com/privatenumber/tsx) | Full-stack server proxy protecting secret API keys |
| **AI Intelligence**| [@google/genai](https://www.npmjs.com/package/@google/genai) | Gemini Flash models with structured response schemas |

---

## Project Structure

```text
├── server.ts                     # Express backend proxy for Gemini AI & Vite middleware
├── src/
│   ├── App.tsx                   # Core application layout, workflow orchestration & state
│   ├── main.tsx                  # React DOM entrypoint
│   ├── types.ts                  # TypeScript interfaces for audit results, clauses & requests
│   ├── components/
│   │   ├── Header.tsx            # App branding header & legal disclaimer banner
│   │   ├── DocumentUploader.tsx  # Drag-and-drop file upload, audience picker & sample loader
│   │   ├── OverviewCard.tsx      # Fairness gauge (0-100), risk counts & action toolbar
│   │   ├── ClauseCard.tsx        # Individual clause risk card with legalese translation & fix
│   │   ├── ChecklistSection.tsx  # Interactive pre-signing action checklist
│   │   ├── LegalGlossary.tsx     # Expandable glossary of legal terms & negotiation tips
│   │   ├── AskLawyerModal.tsx    # Q&A consultation prep simulation & attorney question builder
│   │   ├── NegotiationEmailModal.tsx # Polite counter-proposal email generator
│   │   └── MarkdownReportModal.tsx   # Raw markdown view and copy utility
│   ├── data/
│   │   ├── sampleContracts.ts    # Realistic test contracts (Lease, Freelance MSA, SaaS TOS)
│   │   └── legalGlossaryData.ts  # Legal term definitions, examples & negotiation tactics
│   ├── services/
│   │   └── heuristicAuditor.ts   # Rule-based fallback auditor for offline/graceful degradation
│   └── utils/
│       └── pdfGenerator.ts       # Multi-page printable legal memorandum generator (jsPDF)
├── index.html                    # Application HTML entry point
├── metadata.json                 # AI Studio applet configuration & permissions
├── package.json                  # Dependencies, build scripts and configurations
└── vite.config.ts                # Vite configuration
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**
- **Gemini API Key**: A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/). *(Optional: App gracefully falls back to the heuristic engine if no key is provided)*

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/clauseguard.git
cd clauseguard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and configure your API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Build for Production
To create an optimized production bundle:
```bash
npm run build
```
To launch the production server:
```bash
npm run start
```
## Testing & Performance Optimization

### Testing Strategy
ClauseGuard utilizes **Vitest** and **React Testing Library** to validate component rendering, state management, and user interaction flows. 
- **Unit & Integration Tests**: Verify that core components (such as `App.tsx`, document uploaders, and risk auditors) mount correctly and handle data states safely.
- **Run Tests Locally**:
  ```bash
  npm run test
---

## API Endpoints

### `POST /api/audit-contract`
Analyzes text or uploaded document files against legal fairness standards.

**Request Payload:**
```json
{
  "documentText": "Full text of the contract...",
  "targetAudience": "Freelancer",
  "documentName": "Contract Draft.pdf",
  "fileData": "base64EncodedString...",
  "mimeType": "application/pdf"
}
```

**Response:**
```json
{
  "documentType": "Independent Contractor Agreement",
  "fairnessScore": 48,
  "scoreLabel": "Predatory / Critical Risk",
  "executiveSummary": "The agreement shifts broad liabilities...",
  "keyClauses": [
    {
      "id": "c1",
      "clauseName": "Indemnification",
      "riskLevel": "HIDDEN_TRAP",
      "originalSnippet": "Contractor shall indemnify...",
      "plainEnglishTranslation": "You pay for their legal defense...",
      "potentialRisk": "Uncapped liability for third-party suits...",
      "suggestedRevision": "Each party shall mutually indemnify..."
    }
  ],
  "actionableChecklist": [
    {
      "id": "chk1",
      "actionText": "Request a mutual liability cap equal to total fees paid."
    }
  ],
  "disclaimer": "Informational assessment only...",
  "rawMarkdownReport": "# Full Assessment...",
  "analyzedAt": "2026-09-16T10:00:00.000Z"
}
```

### `GET /api/health`
Health check endpoint returning service status.

---

## Legal Disclaimer

> **IMPORTANT NOTICE**: ClauseGuard is an automated artificial intelligence and algorithmic analysis tool designed strictly for educational, informational, and contract-review preparation purposes. ClauseGuard does not provide formal legal advice, legal opinions, or legal representation, and no attorney-client relationship is formed. Laws and enforceability vary significantly by jurisdiction, governing law, and individual facts. Always consult a licensed attorney in your jurisdiction before executing binding legal agreements or waiving legal rights.

---

## License

This project is licensed under the [MIT License](LICENSE).
