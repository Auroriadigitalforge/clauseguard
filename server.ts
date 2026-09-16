import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { performHeuristicLegalAudit } from './src/services/heuristicAuditor';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous size limit for contract documents and base64 files
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Lazy initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ClauseGuard Legal Risk Auditor',
    time: new Date().toISOString(),
  });
});

// Helper to extract clean human-readable error messages
function extractErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred during document audit.';
  const msg = err.message || String(err);
  try {
    const jsonMatch = msg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch (_) {}
  return msg;
}

// Fallback execution across valid Gemini models with multi-round retry for 503/temporary spikes
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  requestParams: { contents: any; config?: any }
) {
  // Available models - prioritized by reliability during high-demand spikes
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: any = null;

  for (let round = 1; round <= 2; round++) {
    for (const model of candidateModels) {
      try {
        console.log(`Auditing document with model: ${model} (round ${round})...`);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Model request timed out (503 UNAVAILABLE)')), 12000)
        );
        const response = (await Promise.race([
          ai.models.generateContent({
            ...requestParams,
            model,
          }),
          timeoutPromise,
        ])) as any;
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED');

        console.warn(`Model ${model} failed in round ${round} (${isTransient ? 'transient spike' : 'error'}):`, extractErrorMessage(err));

        if (!isTransient) {
          throw err;
        }
      }
    }

    if (round < 2) {
      console.log('Temporary regional demand spike across candidate models. Backing off 1500ms before retry...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  throw lastError;
}
app.post('/api/audit-contract', async (req, res) => {
  try {
    const { documentText, fileData, mimeType, documentName, targetAudience } = req.body;

    if (!documentText && !fileData) {
      return res.status(400).json({
        error: 'Please provide either document text or an uploaded file to audit.',
      });
    }

    const ai = getAiClient();

    const systemInstruction = `You are ClauseGuard, an expert legal risk auditor and plain-English translator built to empower everyday consumers, students, and freelancers.

Your objective is to analyze uploaded legal documents (contracts, terms of service, leases, agreements) and extract hidden risks, predatory clauses, and obligations without replacing formal legal counsel.

Follow these strict output rules:
1. Tone: Objective, protective, clear, and professional. Avoid overly complex legal jargon; translate legalese into plain English.
2. Risk Stratification: Categorize every major finding or clause into one of three tiers:
   - 🟢 SAFE (Standard, fair, or balanced terms)
   - 🟡 CAUTION (Ambiguous, slightly one-sided, or requires careful attention)
   - 🔴 HIDDEN TRAP (Predatory, highly unfavorable, hidden fees, unfair penalties, or restricted rights)
3. Guardrail: Always include a polite disclaimer stating that your output is for informational and preparation purposes only and does not constitute formal legal advice.
4. Formatting: Structure your response cleanly using markdown headings, bullet points, and specific risk tags.

Also generate a complete, meticulously formatted raw markdown report matching this exact structure:

### 1. Document Overview
- **Document Type:** (e.g., Residential Lease, Freelance Contract, App ToS)
- **Overall Fairness Score:** (Score out of 100, where 100 is completely fair and 0 is extremely high risk)
- **Executive Summary:** (2-3 sentences explaining what this document is and the primary things to watch out for before signing)

### 2. The Risk Audit (Key Clauses & Hidden Traps)
Analyze the document and list the most important clauses categorized by risk level (🟢 SAFE, 🟡 CAUTION, 🔴 HIDDEN TRAP). For each item include:
- **Clause / Topic Name:**
- **Risk Level:** (🟢 SAFE / 🟡 CAUTION / 🔴 HIDDEN TRAP)
- **What it says (Legalese translation):** (Clear, plain-English explanation of what the text actually enforces)
- **Why it matters / Potential Risk:** (The hidden catch or real-world consequence for the user)

### 3. Actionable Checklist & Next Steps
- Provide 3-5 concrete actions or questions the user should address or negotiate before signing this document (e.g., specific clauses to ask the other party to modify).

### Disclaimer
*Reminder: This analysis is generated by ClauseGuard for informational purposes and does not constitute formal legal advice.*`;

    // Construct prompt parts
    const parts: any[] = [];

    if (fileData && mimeType) {
      parts.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType,
        },
      });
      parts.push({
        text: `Please conduct a comprehensive legal risk audit on this attached file (${documentName || 'Uploaded Document'}). Target Audience perspective: ${targetAudience || 'General Consumer / Freelancer'}. Follow the system instruction precisely.`,
      });
    } else {
      parts.push({
        text: `Please conduct a comprehensive legal risk audit on the following legal document (${documentName || 'Legal Document'}).
Target Audience perspective: ${targetAudience || 'General Consumer / Freelancer'}.

DOCUMENT TEXT:
---
${documentText}
---`,
      });
    }

    // Call Gemini with structured JSON response schema and fallback models
    const response = await generateContentWithRetryAndFallback(ai, {
      contents: parts,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for precise legal extraction
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: {
              type: Type.STRING,
              description: 'Type of document (e.g. Residential Lease, Freelance Contract, App ToS)',
            },
            fairnessScore: {
              type: Type.INTEGER,
              description: 'Fairness score from 0 to 100, where 100 is completely fair and 0 is predatory',
            },
            scoreLabel: {
              type: Type.STRING,
              description: 'Short descriptor of fairness, e.g., "High Risk / Predatory", "Fair & Standard", "Caution Advised"',
            },
            executiveSummary: {
              type: Type.STRING,
              description: '2-3 sentences explaining what this document is and primary red flags to watch out for before signing',
            },
            keyClauses: {
              type: Type.ARRAY,
              description: 'List of analyzed clauses categorized by risk level',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  clauseName: { type: Type.STRING, description: 'Descriptive title of clause or topic' },
                  riskLevel: {
                    type: Type.STRING,
                    enum: ['SAFE', 'CAUTION', 'HIDDEN_TRAP'],
                    description: 'SAFE, CAUTION, or HIDDEN_TRAP',
                  },
                  originalSnippet: {
                    type: Type.STRING,
                    description: 'Direct quote or excerpt from the contract if available',
                  },
                  plainEnglishTranslation: {
                    type: Type.STRING,
                    description: 'What it says: clear, plain-English explanation of what the text actually enforces',
                  },
                  potentialRisk: {
                    type: Type.STRING,
                    description: 'Why it matters / Potential Risk: hidden catch or real-world consequence',
                  },
                  suggestedRevision: {
                    type: Type.STRING,
                    description: 'A recommended redline or negotiation clause to counter this term',
                  },
                },
                required: ['clauseName', 'riskLevel', 'plainEnglishTranslation', 'potentialRisk'],
              },
            },
            actionableChecklist: {
              type: Type.ARRAY,
              description: '3-5 concrete actions or negotiation questions before signing',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  actionText: { type: Type.STRING, description: 'Actionable step or negotiation point' },
                  category: { type: Type.STRING, description: 'E.g. Negotiation, Clarification, Redline' },
                },
                required: ['actionText'],
              },
            },
            rawMarkdownReport: {
              type: Type.STRING,
              description: 'Full markdown formatted report according to the requested 3-section format plus disclaimer',
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Standard ClauseGuard informational disclaimer',
            },
          },
          required: [
            'documentType',
            'fairnessScore',
            'executiveSummary',
            'keyClauses',
            'actionableChecklist',
            'rawMarkdownReport',
          ],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON response from Gemini:', responseText);
      return res.status(500).json({
        error: 'Failed to parse legal risk report from Gemini.',
        details: responseText.slice(0, 300),
      });
    }

    // Enhance and normalize output
    const result = {
      ...parsedData,
      analyzedAt: new Date().toISOString(),
      documentTitle: documentName || parsedData.documentType || 'Analyzed Document',
      targetAudience: targetAudience || 'Consumer',
      engineMode: 'gemini',
      disclaimer:
        parsedData.disclaimer ||
        'Reminder: This analysis is generated by ClauseGuard for informational and preparation purposes only and does not constitute formal legal advice.',
    };

    res.json(result);
  } catch (err: any) {
    console.error('Error during contract audit:', err);

    // If upstream AI failed due to high demand / 503 / 429 spike, activate the built-in legal rules engine fallback
    const errMsg = err?.message || String(err);
    const isTransient =
      errMsg.includes('503') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('high demand') ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED');

    const { documentText, fileData, mimeType, documentName, targetAudience } = req.body || {};
    let textToAnalyze = documentText || '';

    if (!textToAnalyze && fileData) {
      try {
        const rawBuffer = Buffer.from(fileData, 'base64');
        if (mimeType?.includes('text') || mimeType?.includes('json')) {
          textToAnalyze = rawBuffer.toString('utf-8');
        } else {
          // Extract printable ASCII text from document buffer
          textToAnalyze = rawBuffer.toString('latin1').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        }
      } catch (_) {}
    }

    if (isTransient && textToAnalyze && textToAnalyze.trim().length > 15) {
      console.warn(
        'Upstream Gemini models experiencing persistent 503 spike. Activating ClauseGuard Built-in Legal Rules Engine fallback...'
      );
      try {
        const fallbackResult = performHeuristicLegalAudit(
          textToAnalyze,
          documentName,
          targetAudience
        );
        return res.json(fallbackResult);
      } catch (fallbackErr) {
        console.error('Heuristic fallback failed:', fallbackErr);
      }
    }

    res.status(500).json({
      error: extractErrorMessage(err),
    });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClauseGuard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
