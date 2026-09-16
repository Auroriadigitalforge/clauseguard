export type RiskLevel = 'SAFE' | 'CAUTION' | 'HIDDEN_TRAP';

export interface ClauseAuditItem {
  id: string;
  clauseName: string;
  riskLevel: RiskLevel;
  originalSnippet?: string;
  plainEnglishTranslation: string;
  potentialRisk: string;
  suggestedRevision?: string;
}

export interface ActionableChecklistItem {
  id: string;
  actionText: string;
  category?: string;
  completed?: boolean;
}

export interface ClauseGuardAuditResult {
  documentType: string;
  fairnessScore: number; // 0 to 100
  scoreLabel: string; // e.g. "Predatory / Critical Risk", "Requires Heavy Negotiation", "Balanced & Reasonable"
  executiveSummary: string;
  keyClauses: ClauseAuditItem[];
  actionableChecklist: ActionableChecklistItem[];
  disclaimer: string;
  rawMarkdownReport: string;
  analyzedAt: string;
  documentTitle?: string;
  targetAudience?: string; // e.g. Freelancer, Tenant, Consumer, Student
  engineMode?: 'gemini' | 'heuristic_engine';
  noticeMessage?: string;
}

export interface AuditRequestPayload {
  documentText?: string;
  fileData?: string; // base64
  mimeType?: string;
  documentName?: string;
  targetAudience?: string;
}
