import { describe, it, expect, vi } from 'vitest';

/**
 * Mock helper simulating end-to-end audit response validation
 */
export interface MockAuditOptions {
  fairnessScore: number;
  documentType: string;
  trapCount: number;
}

export function createMockAuditResponse(options: Partial<MockAuditOptions> = {}) {
  const { fairnessScore = 52, documentType = 'Lease Agreement', trapCount = 2 } = options;

  const keyClauses = Array.from({ length: trapCount }, (_, i) => ({
    id: `clause-${i + 1}`,
    clauseName: `Test Flagged Clause ${i + 1}`,
    riskLevel: 'HIDDEN_TRAP' as const,
    originalSnippet: `Sample legal snippet ${i + 1}`,
    plainEnglishTranslation: `Translated plain English explanation ${i + 1}`,
    potentialRisk: `Exposure risk detail ${i + 1}`,
    suggestedRevision: `Recommended balanced revision ${i + 1}`,
  }));

  return {
    documentType,
    fairnessScore,
    scoreLabel: fairnessScore < 50 ? 'Predatory / Critical Risk' : 'High Risk',
    executiveSummary: 'Automated test executive summary.',
    keyClauses,
    actionableChecklist: [
      { id: 'check-1', actionText: 'Request mutual liability limitation' },
      { id: 'check-2', actionText: 'Eliminate automatic renewal evergreen clause' },
    ],
    disclaimer: 'For educational testing purposes only.',
    rawMarkdownReport: '# Audit Report\n\nSample test output',
    analyzedAt: new Date().toISOString(),
  };
}

describe('Test Validation Helpers', () => {
  it('creates structured mock audit responses conforming to AuditResult schema', () => {
    const mockData = createMockAuditResponse({ fairnessScore: 42, trapCount: 3 });

    expect(mockData.fairnessScore).toBe(42);
    expect(mockData.keyClauses).toHaveLength(3);
    expect(mockData.keyClauses[0].riskLevel).toBe('HIDDEN_TRAP');
    expect(mockData.actionableChecklist).toHaveLength(2);
  });
});
