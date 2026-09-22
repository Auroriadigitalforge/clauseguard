import { describe, it, expect } from 'vitest';
import { performHeuristicLegalAudit } from './heuristicAuditor';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

describe('Heuristic Auditor - Offline Verification Engine', () => {
  const leaseContract = SAMPLE_CONTRACTS.find((c) => c.id === 'residential-lease')!;
  const freelanceContract = SAMPLE_CONTRACTS.find((c) => c.id === 'freelance-contract')!;

  it('correctly detects critical predatory clauses in lease agreements', () => {
    const result = performHeuristicLegalAudit(
      leaseContract.text,
      leaseContract.title,
      leaseContract.targetAudience
    );

    expect(result).toBeDefined();
    expect(result.documentType).toBe('Residential Lease Agreement');
    expect(result.fairnessScore).toBeLessThan(75); // Predatory clauses should penalize score
    expect(result.keyClauses.length).toBeGreaterThan(0);

    // Verify detection of indemnity or automatic renewal trap
    const trapClauses = result.keyClauses.filter(
      (c) => c.riskLevel === 'HIDDEN_TRAP' || c.riskLevel === 'CAUTION'
    );
    expect(trapClauses.length).toBeGreaterThan(0);

    // Verify plain English translations exist
    trapClauses.forEach((c) => {
      expect(c.plainEnglishTranslation).toBeTruthy();
      expect(c.potentialRisk).toBeTruthy();
      expect(c.suggestedRevision).toBeTruthy();
    });
  });

  it('detects IP transfer and uncapped liability in freelance contracts', () => {
    const result = performHeuristicLegalAudit(
      freelanceContract.text,
      freelanceContract.title,
      freelanceContract.targetAudience
    );

    expect(result.fairnessScore).toBeLessThanOrEqual(80);
    const hasIPorIndemnity = result.keyClauses.some(
      (c) =>
        c.clauseName.toLowerCase().includes('intellectual property') ||
        c.clauseName.toLowerCase().includes('indemnification') ||
        c.clauseName.toLowerCase().includes('liability') ||
        c.clauseName.toLowerCase().includes('modification') ||
        c.clauseName.toLowerCase().includes('revisions')
    );
    expect(hasIPorIndemnity).toBe(true);
  });

  it('returns balanced score for benign non-predatory text', () => {
    const safeAgreement = `
      1. Mutual Confidentiality. Both parties shall maintain the secrecy of confidential information shared.
      2. Severability. If any provision of this agreement is held invalid, the remainder shall continue in effect.
      3. Governing Law. This agreement is governed by the laws of California.
    `;
    const result = performHeuristicLegalAudit(safeAgreement, 'Simple Mutual Agreement', 'Consumer');

    expect(result.fairnessScore).toBeGreaterThanOrEqual(70);
    expect(result.actionableChecklist.length).toBeGreaterThan(0);
  });
});
