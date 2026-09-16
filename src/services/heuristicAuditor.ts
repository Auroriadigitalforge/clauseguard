import { ClauseGuardAuditResult, ClauseAuditItem, ActionableChecklistItem, RiskLevel } from '../types';

interface ClauseRule {
  id: string;
  name: string;
  pattern: RegExp;
  riskLevel: RiskLevel;
  plainEnglishTranslation: string;
  potentialRisk: string;
  suggestedRevision: string;
}

const RULES: ClauseRule[] = [
  {
    id: 'auto-renewal',
    name: 'Automatic Renewal & Strict Notice Window',
    pattern: /(renew(s|al|ed)?\s+automatically|automatic\s+renewal|evergreen|shall\s+automatically\s+renew|unless\s+written\s+notice\s+is\s+received|notice\s+by\s+certified\s+mail)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'This agreement will automatically renew for another full term (often 12 months) unless you submit formal cancellation notice far in advance, frequently using restrictive methods like certified mail.',
    potentialRisk:
      'If you miss the tight cancellation window, you will be legally trapped for another billing cycle or full year with severe financial penalties or automatic rent/rate hikes.',
    suggestedRevision:
      'Require mutual written opt-in for any renewal rather than automatic renewal, or allow cancellation anytime upon 30 days standard written email notice without penalty.',
  },
  {
    id: 'unilateral-modification',
    name: 'Unilateral Modification of Terms',
    pattern: /(modify\s+these\s+terms\s+at\s+any\s+time|sole\s+discretion\s+to\s+change|without\s+prior\s+notice|reserve\s+the\s+right\s+to\s+modify|change\s+the\s+terms\s+and\s+conditions)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'The issuing party reserves the sole power to change rules, fees, service levels, or obligations at any time without asking for your consent or providing meaningful advance notice.',
    potentialRisk:
      'Pricing can increase or your key protections can be eliminated unilaterally after you sign, while your continued use is deemed acceptance.',
    suggestedRevision:
      'Any changes to the agreement must be communicated at least 30 days in advance in writing, and you must retain the right to terminate penalty-free if you do not accept the changes.',
  },
  {
    id: 'broad-indemnity',
    name: 'Broad One-Sided Indemnification',
    pattern: /(indemnif(y|ies|ication)|hold\s+harmless|defend,\s+indemnify|against\s+any\s+and\s+all\s+claims,\s+damages,\s+liabilities)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'You are promising to pay for all legal defense bills, court judgments, and financial damages incurred by the other party if a dispute or third-party claim arises.',
    potentialRisk:
      'This exposes you to potentially catastrophic personal financial liability far exceeding the value of the contract, even for matters beyond your control.',
    suggestedRevision:
      'Make indemnification strictly mutual, limited solely to direct damages resulting from gross negligence or intentional misconduct, and capped at total fees paid under this agreement.',
  },
  {
    id: 'ip-overreach',
    name: 'Overreaching Intellectual Property Assignment',
    pattern: /(all\s+intellectual\s+property|work\s+made\s+for\s+hire|prior\s+to,\s+during,\s+or\s+after|sole\s+and\s+exclusive\s+property\s+of|waives\s+all\s+moral\s+rights|inventions\s+conceived)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'The client claims ownership over every piece of work, invention, or idea you develop, occasionally attempting to claim assets you created prior to or outside the contract scope.',
    potentialRisk:
      'You could forfeit your pre-existing tools, code libraries, creative methods, or rights to reuse foundational components in your own future career.',
    suggestedRevision:
      'Explicitly state that IP transfer only covers final unique deliverables created specifically for the client upon full payment, and expressly retain all pre-existing and background IP.',
  },
  {
    id: 'binding-arbitration',
    name: 'Mandatory Binding Arbitration & Class Action Waiver',
    pattern: /(binding\s+arbitration|waive\s+(any|all)\s+right\s+to\s+a\s+jury\s+trial|class\s+action\s+waiver|individual\s+basis\s+only\s+and\s+not\s+as\s+a\s+plaintiff\s+or\s+class|american\s+arbitration\s+association)/i,
    riskLevel: 'CAUTION',
    plainEnglishTranslation:
      'You forfeit your constitutional right to take legal disputes to an open court of law or join other affected individuals in a class-action lawsuit, submitting instead to private closed arbitration.',
    potentialRisk:
      'Private arbitration is often more favorable to corporations, keeps proceedings secret, eliminates public accountability, and can impose upfront filing hurdles.',
    suggestedRevision:
      'Insert a 30-day opt-out provision for the arbitration clause, or preserve both parties’ right to file disputes in local Small Claims Court.',
  },
  {
    id: 'punitive-payment',
    name: 'Unreasonable Payment Terms & Approval Discretion',
    pattern: /(net\s+60|net\s+90|net\s+120|at\s+client('s)?\s+sole\s+discretion|satisfaction\s+guarantee|payable\s+only\s+upon\s+acceptance|withhold\s+payment)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'The client has prolonged payment windows (such as 60-90 days) and the unilateral power to withhold compensation based on subjective satisfaction.',
    potentialRisk:
      'You could perform weeks or months of work with no guarantee of prompt compensation, effectively acting as an interest-free lender to the client.',
    suggestedRevision:
      'Update payment terms to Net 15 or Net 30, require a 50% upfront deposit, and deem deliverables accepted if no written objection is received within 7 business days.',
  },
  {
    id: 'excessive-penalties',
    name: 'Punitive Late Fees & Liquidated Damages',
    pattern: /(liquidated\s+damages|late\s+fee\s+of\s+\d+%|penalty\s+of|interest\s+shall\s+accrue\s+at\s+(\d+|[0-9]+)%|daily\s+penalty)/i,
    riskLevel: 'CAUTION',
    plainEnglishTranslation:
      'Strict monetary penalties or daily compounding interest apply if payments, returns, or deadlines are missed.',
    potentialRisk:
      'A minor oversight can snowball into hundreds or thousands of dollars in compounding penalty charges.',
    suggestedRevision:
      'Add a mandatory 5-business-day grace period with written notice before any late fee applies, and cap interest to statutory limits.',
  },
  {
    id: 'non-disparagement',
    name: 'Gag Clause & Non-Disparagement',
    pattern: /(non-disparagement|shall\s+not\s+disparage|negative,\s+derogatory,\s+or\s+critical|restrict\s+public\s+reviews|restrict\s+online\s+reviews)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'Forbids you from saying or posting anything critical or negative about the company, its products, or services publicly.',
    potentialRisk:
      'Prevents you from leaving honest reviews or warning other consumers, with threats of legal liability if you voice genuine complaints.',
    suggestedRevision:
      'Remove the non-disparagement clause or ensure it explicitly protects truthful consumer reviews and legal compliance.',
  },
  {
    id: 'unilateral-termination',
    name: 'Unilateral Termination for Convenience',
    pattern: /(terminate\s+at\s+any\s+time\s+with\s+or\s+without\s+cause|immediate\s+termination\s+by|terminate\s+this\s+agreement\s+without\s+cause\s+upon\s+\d+\s+days)/i,
    riskLevel: 'CAUTION',
    plainEnglishTranslation:
      'One party can cancel the contract at any time for any reason, without showing any breach of contract.',
    potentialRisk:
      'If asymmetrical, you may dedicate time, capital, and resources only to have the contract cancelled abruptly with no severance or wind-down payment.',
    suggestedRevision:
      'Ensure termination for convenience is strictly mutual, requires at least 30 days written notice, and guarantees immediate pro-rata payment for all work performed.',
  },
  {
    id: 'landlord-entry',
    name: 'Unrestricted Landlord Access to Premises',
    pattern: /(landlord\s+may\s+enter\s+without\s+notice|inspect\s+the\s+premises\s+at\s+any\s+time|entry\s+without\s+prior\s+notice|enter\s+at\s+any\s+hour)/i,
    riskLevel: 'HIDDEN_TRAP',
    plainEnglishTranslation:
      'The landlord reserves the right to enter your residential or rented space without advance notice or specific emergency grounds.',
    potentialRisk:
      'Compromises your fundamental right to quiet enjoyment, privacy, and personal safety.',
    suggestedRevision:
      'Require at least 24 hours advance written notice for non-emergency entries, restricted to reasonable daytime business hours.',
  },
  {
    id: 'severability',
    name: 'Severability & Legal Enforceability',
    pattern: /(severability|if\s+any\s+provision\s+is\s+held\s+invalid|remainder\s+of\s+this\s+agreement\s+shall\s+continue)/i,
    riskLevel: 'SAFE',
    plainEnglishTranslation:
      'If a court invalidates one specific clause of this contract, the remaining valid sections remain legally binding.',
    potentialRisk:
      'Standard contract protective boilerplate that prevents the entire document from collapsing over an isolated clerical error.',
    suggestedRevision: 'Standard and acceptable as written.',
  },
  {
    id: 'confidentiality',
    name: 'Mutual Confidentiality & Non-Disclosure',
    pattern: /(confidential\s+information|shall\s+maintain\s+the\s+secrecy|non-disclosure|keep\s+confidential)/i,
    riskLevel: 'SAFE',
    plainEnglishTranslation:
      'Both parties agree not to disclose confidential proprietary information, business data, or trade secrets shared during the relationship.',
    potentialRisk:
      'Standard business protection, provided it protects both parties equally and excludes publicly known information.',
    suggestedRevision:
      'Confirm that confidentiality is reciprocal and includes standard exclusions for public information or court orders.',
  },
];

export function performHeuristicLegalAudit(
  text: string,
  documentName?: string,
  targetAudience?: string
): ClauseGuardAuditResult {
  const cleanText = text || '';
  const detectedClauses: ClauseAuditItem[] = [];
  const matchedRuleIds = new Set<string>();

  // Scan document for known risk rules
  for (const rule of RULES) {
    const match = cleanText.match(rule.pattern);
    if (match && !matchedRuleIds.has(rule.id)) {
      matchedRuleIds.add(rule.id);

      // Extract a sentence around the match for the original snippet
      let originalSnippet: string | undefined;
      const matchIndex = match.index || 0;
      const start = Math.max(0, cleanText.lastIndexOf('.', matchIndex) + 1);
      let end = cleanText.indexOf('.', matchIndex + match[0].length);
      if (end === -1) end = Math.min(cleanText.length, matchIndex + match[0].length + 120);
      originalSnippet = cleanText.substring(start, end + 1).trim();
      if (originalSnippet.length > 250) {
        originalSnippet = originalSnippet.slice(0, 247) + '...';
      }

      detectedClauses.push({
        id: rule.id,
        clauseName: rule.name,
        riskLevel: rule.riskLevel,
        originalSnippet: originalSnippet || match[0],
        plainEnglishTranslation: rule.plainEnglishTranslation,
        potentialRisk: rule.potentialRisk,
        suggestedRevision: rule.suggestedRevision,
      });
    }
  }

  // If few or no specific rules triggered, supply balanced standard insights
  if (detectedClauses.length === 0) {
    detectedClauses.push({
      id: 'general-terms',
      clauseName: 'General Terms of Service & Obligations',
      riskLevel: 'CAUTION',
      plainEnglishTranslation:
        'The provided text outlines operating terms, requirements, and responsibilities governing your usage or participation.',
      potentialRisk:
        'Standard language may contain unspecified obligations or limitations of warranty; careful line-by-line review is recommended.',
      suggestedRevision:
        'Verify all pricing, renewal schedules, and termination notices explicitly in writing before committing.',
    });
  }

  // Sort: HIDDEN_TRAP first, then CAUTION, then SAFE
  detectedClauses.sort((a, b) => {
    const rank = { HIDDEN_TRAP: 0, CAUTION: 1, SAFE: 2 };
    return rank[a.riskLevel] - rank[b.riskLevel];
  });

  // Calculate fairness score dynamically
  const trapCount = detectedClauses.filter((c) => c.riskLevel === 'HIDDEN_TRAP').length;
  const cautionCount = detectedClauses.filter((c) => c.riskLevel === 'CAUTION').length;
  const safeCount = detectedClauses.filter((c) => c.riskLevel === 'SAFE').length;

  let calculatedScore = 88;
  calculatedScore -= trapCount * 22;
  calculatedScore -= cautionCount * 8;
  calculatedScore += safeCount * 4;
  calculatedScore = Math.max(8, Math.min(95, calculatedScore));

  let scoreLabel = 'Balanced & Fair';
  if (calculatedScore < 35) {
    scoreLabel = 'Predatory / Critical Risk';
  } else if (calculatedScore < 65) {
    scoreLabel = 'High Risk / Requires Heavy Negotiation';
  } else if (calculatedScore < 80) {
    scoreLabel = 'Moderate Risk / Minor Revision Recommended';
  }

  // Determine document type
  let docType = 'Legal Agreement';
  const lower = cleanText.toLowerCase();
  if (lower.includes('lease') || lower.includes('tenant') || lower.includes('landlord')) {
    docType = 'Residential Lease Agreement';
  } else if (lower.includes('freelanc') || lower.includes('contractor') || lower.includes('work for hire')) {
    docType = 'Freelance Independent Contractor Agreement';
  } else if (lower.includes('membership') || lower.includes('gym') || lower.includes('fitness')) {
    docType = 'Membership & Service Agreement';
  } else if (lower.includes('terms of service') || lower.includes('privacy policy') || lower.includes('platform')) {
    docType = 'Terms of Service (ToS)';
  } else if (lower.includes('employment') || lower.includes('employee')) {
    docType = 'Employment Agreement';
  }

  const executiveSummary =
    trapCount > 0
      ? `This document contains ${trapCount} critical hidden trap(s) and ${cautionCount} cautionary term(s) that heavily favor the drafting party. You face unilateral liabilities, automatic financial commitments, or surrendered legal rights unless these clauses are redlined prior to signing.`
      : `This document contains mostly standard operational terms with ${cautionCount} point(s) of caution. Review the notice periods and liability boundaries before signing.`;

  // Build actionable checklist
  const actionableChecklist: ActionableChecklistItem[] = [
    {
      id: 'action-1',
      category: 'Negotiation',
      actionText:
        trapCount > 0
          ? `Submit formal redlines targeting the ${trapCount} flagged hidden trap(s)—specifically demanding mutual protections and deleting one-sided penalties.`
          : 'Request written confirmation of key milestone dates and cancellation terms before signing.',
    },
    {
      id: 'action-2',
      category: 'Clarification',
      actionText:
        'Ask the drafting party to clarify in writing whether renewals, changes, and notices can be handled via standard email rather than restricted certified mail.',
    },
    {
      id: 'action-3',
      category: 'Financial Protection',
      actionText:
        'Verify that all payment schedules, fee caps, and penalty grace periods are clearly defined with an explicit 5-day cure window.',
    },
    {
      id: 'action-4',
      category: 'Documentation',
      actionText:
        'Save an original signed timestamped copy along with all email communications confirming agreed verbal promises.',
    },
  ];

  // Generate Raw Markdown Report adhering strictly to ClauseGuard format
  const rawMarkdownReport = `### 1. Document Overview
- **Document Type:** ${docType}
- **Overall Fairness Score:** ${calculatedScore}/100 (${scoreLabel})
- **Executive Summary:** ${executiveSummary}

### 2. The Risk Audit (Key Clauses & Hidden Traps)
${detectedClauses
  .map((clause) => {
    const icon =
      clause.riskLevel === 'HIDDEN_TRAP' ? '🔴 HIDDEN TRAP' : clause.riskLevel === 'CAUTION' ? '🟡 CAUTION' : '🟢 SAFE';
    return `#### ${clause.clauseName}
- **Risk Level:** ${icon}
- **What it says (Legalese translation):** ${clause.plainEnglishTranslation}
- **Why it matters / Potential Risk:** ${clause.potentialRisk}
${clause.suggestedRevision ? `- **Counter Suggestion:** ${clause.suggestedRevision}` : ''}
`;
  })
  .join('\n')}

### 3. Actionable Checklist & Next Steps
${actionableChecklist.map((item, idx) => `${idx + 1}. **[${item.category}]** ${item.actionText}`).join('\n')}

### Disclaimer
*Reminder: This analysis is generated by ClauseGuard for informational and preparation purposes only and does not constitute formal legal advice.*
`;

  return {
    documentType: docType,
    fairnessScore: calculatedScore,
    scoreLabel,
    executiveSummary,
    keyClauses: detectedClauses,
    actionableChecklist,
    rawMarkdownReport,
    disclaimer:
      'Reminder: This analysis is generated by ClauseGuard for informational and preparation purposes only and does not constitute formal legal advice.',
    analyzedAt: new Date().toISOString(),
    documentTitle: documentName || docType,
    targetAudience: targetAudience || 'Consumer',
    engineMode: 'heuristic_engine',
    noticeMessage:
      'Analysis completed using ClauseGuard Built-in Legal Rules Engine due to temporary upstream Gemini AI high-demand. You can re-run with AI anytime.',
  };
}
