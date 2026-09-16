import { jsPDF } from 'jspdf';
import { ClauseGuardAuditResult } from '../types';
import { identifyDocumentGlossaryTerms, LEGAL_GLOSSARY } from '../data/legalGlossaryData';

export interface PdfGenerationResult {
  fileName: string;
  pageCount: number;
}

/**
 * Builds the complete multi-page jsPDF document for the risk assessment report.
 */
export function buildAuditPdfDocument(
  audit: ClauseGuardAuditResult,
  documentText?: string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 612 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 792 pt
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 532 pt
  const marginBottom = 48;

  let currentY = 0;

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('CLAUSEGUARD LEGAL RISK ASSESSMENT REPORT', marginX, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    const titleSnippet = (audit.documentTitle || audit.documentType || 'Contract').slice(0, 45);
    doc.text(titleSnippet, pageWidth - marginX, 32, { align: 'right' });

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.75);
    doc.line(marginX, 38, pageWidth - marginX, 38);
  };

  // Helper to check page boundary and auto-insert page with running header
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = 52;
      drawRunningHeader();
    }
  };

  // -------------------------------------------------------------
  // 1. EXECUTIVE HEADER BANNER (Dark slate navy with emerald accent)
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 92, 'F');

  // Brand Accent Bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(marginX, 22, 5, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('CLAUSEGUARD', marginX + 12, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('LEGAL RISK AUDITOR & PLAIN-ENGLISH TRANSLATOR', marginX + 12, 52);

  const formattedDate = new Date(audit.analyzedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`AUDIT DATE: ${formattedDate.toUpperCase()}`, pageWidth - marginX, 36, { align: 'right' });
  doc.text(
    `AUDIENCE: ${(audit.targetAudience || 'CONSUMER').toUpperCase()}`,
    pageWidth - marginX,
    49,
    { align: 'right' }
  );
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('REPORT STATUS: VERIFIED AUDIT', pageWidth - marginX, 62, { align: 'right' });

  currentY = 112;

  // -------------------------------------------------------------
  // 2. DOCUMENT SUMMARY & FAIRNESS SCORE CARD
  // -------------------------------------------------------------
  const docTitle = audit.documentTitle || audit.documentType || 'Legal Agreement';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(docTitle, marginX, currentY);

  currentY += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Document Classification: ${audit.documentType}`, marginX, currentY);

  currentY += 14;

  // Score Box Container
  const scoreBoxY = currentY;
  const scoreBoxHeight = 84;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(marginX, scoreBoxY, contentWidth, scoreBoxHeight, 6, 6, 'FD');

  // Score badge calculation
  const score = Math.round(audit.fairnessScore || 0);
  let scoreBgColor: [number, number, number] = [16, 185, 129]; // emerald
  let scoreLabelColor: [number, number, number] = [6, 95, 70];
  let defaultLabel = 'Fair & Balanced';
  if (score < 45) {
    scoreBgColor = [239, 68, 68]; // rose-500
    scoreLabelColor = [153, 27, 27];
    defaultLabel = 'Critical Legal Risk';
  } else if (score < 75) {
    scoreBgColor = [245, 158, 11]; // amber-500
    scoreLabelColor = [146, 64, 14];
    defaultLabel = 'Caution Advised';
  }

  // Large score pill
  doc.setFillColor(...scoreBgColor);
  doc.roundedRect(marginX + 12, scoreBoxY + 12, 72, 60, 6, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(`${score}`, marginX + 48, scoreBoxY + 46, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('/ 100 FAIRNESS', marginX + 48, scoreBoxY + 60, { align: 'center' });

  // Center score information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Overall Risk Rating:', marginX + 96, scoreBoxY + 26);

  doc.setFontSize(11);
  doc.setTextColor(...scoreLabelColor);
  doc.text(audit.scoreLabel || defaultLabel, marginX + 210, scoreBoxY + 26);

  // Clause breakdown badges
  const trapsCount = audit.keyClauses.filter((c) => c.riskLevel === 'HIDDEN_TRAP').length;
  const cautionCount = audit.keyClauses.filter((c) => c.riskLevel === 'CAUTION').length;
  const safeCount = audit.keyClauses.filter((c) => c.riskLevel === 'SAFE').length;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Audit Scope: ${audit.keyClauses.length} substantive clause(s) audited`, marginX + 96, scoreBoxY + 42);

  // 3 Colored Badges
  const badgeY = scoreBoxY + 50;
  // Red badge
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(marginX + 96, badgeY, 112, 20, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text(`[!] ${trapsCount} Hidden Trap${trapsCount !== 1 ? 's' : ''}`, marginX + 104, badgeY + 13);

  // Amber badge
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(marginX + 216, badgeY, 106, 20, 3, 3, 'FD');
  doc.setTextColor(161, 98, 7);
  doc.text(`[*] ${cautionCount} Caution${cautionCount !== 1 ? 's' : ''}`, marginX + 224, badgeY + 13);

  // Green badge
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(marginX + 330, badgeY, 96, 20, 3, 3, 'FD');
  doc.setTextColor(21, 128, 61);
  doc.text(`[v] ${safeCount} Safe Term${safeCount !== 1 ? 's' : ''}`, marginX + 338, badgeY + 13);

  currentY = scoreBoxY + scoreBoxHeight + 16;

  // -------------------------------------------------------------
  // 3. EXECUTIVE SUMMARY
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE SUMMARY', marginX, currentY);
  currentY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(audit.executiveSummary || 'No executive summary provided.', contentWidth - 24);
  const summaryBoxHeight = summaryLines.length * 12.5 + 16;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, summaryBoxHeight, 4, 4, 'FD');

  doc.text(summaryLines, marginX + 12, currentY + 14);
  currentY += summaryBoxHeight + 18;

  // -------------------------------------------------------------
  // 4. CLAUSE-BY-CLAUSE AUDIT
  // -------------------------------------------------------------
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 1: DETAILED CLAUSE AUDIT & PLAIN-ENGLISH TRANSLATIONS', marginX, currentY);
  currentY += 12;

  for (let i = 0; i < audit.keyClauses.length; i++) {
    const clause = audit.keyClauses[i];

    // Pre-calculate line counts
    const origSnippetLines = clause.originalSnippet
      ? doc.splitTextToSize(`"${clause.originalSnippet}"`, contentWidth - 28)
      : [];
    const plainLines = doc.splitTextToSize(clause.plainEnglishTranslation || '', contentWidth - 28);
    const riskLines = doc.splitTextToSize(clause.potentialRisk || '', contentWidth - 28);
    const revisionLines = clause.suggestedRevision
      ? doc.splitTextToSize(clause.suggestedRevision, contentWidth - 28)
      : [];

    let estimatedClauseHeight = 40 + plainLines.length * 11.5 + riskLines.length * 11.5;
    if (origSnippetLines.length > 0) estimatedClauseHeight += origSnippetLines.length * 10.5 + 16;
    if (revisionLines.length > 0) estimatedClauseHeight += revisionLines.length * 11.5 + 18;

    checkPageBreak(Math.min(estimatedClauseHeight, 180));

    const clauseBoxY = currentY;

    // Header bar styling
    let headerBg: [number, number, number] = [241, 245, 249]; // slate-100
    let riskBadgeBg: [number, number, number] = [240, 253, 244];
    let riskBadgeText: [number, number, number] = [22, 101, 52];
    let riskBadgeLabel = 'SAFE';

    if (clause.riskLevel === 'HIDDEN_TRAP') {
      headerBg = [254, 242, 242];
      riskBadgeBg = [239, 68, 68];
      riskBadgeText = [255, 255, 255];
      riskBadgeLabel = 'HIDDEN TRAP';
    } else if (clause.riskLevel === 'CAUTION') {
      headerBg = [254, 252, 232];
      riskBadgeBg = [245, 158, 11];
      riskBadgeText = [255, 255, 255];
      riskBadgeLabel = 'CAUTION';
    }

    let innerY = clauseBoxY + 28;

    // 1. Original Snippet
    const origBoxY = innerY;
    let origBoxH = 0;
    if (origSnippetLines.length > 0) {
      origBoxH = origSnippetLines.length * 10.5 + 14;
      innerY += origBoxH + 6;
    }

    // 2. Plain English
    const plainBoxY = innerY;
    const plainBoxH = plainLines.length * 11.5 + 15;
    innerY += plainBoxH + 6;

    // 3. Potential Risk
    const riskBoxY = innerY;
    const riskBoxH = riskLines.length * 11.5 + 15;
    innerY += riskBoxH + 6;

    // 4. Suggested Revision
    const revBoxY = innerY;
    let revBoxH = 0;
    if (revisionLines.length > 0) {
      revBoxH = revisionLines.length * 11.5 + 15;
      innerY += revBoxH + 6;
    }

    const totalClauseHeight = innerY - clauseBoxY + 4;

    // Outer card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(marginX, clauseBoxY, contentWidth, totalClauseHeight, 5, 5, 'FD');

    // Title banner
    doc.setFillColor(...headerBg);
    doc.roundedRect(marginX, clauseBoxY, contentWidth, 24, 5, 5, 'F');
    doc.rect(marginX, clauseBoxY + 18, contentWidth, 6, 'F'); // flatten bottom radius

    // Clause Number & Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${i + 1}. ${clause.clauseName}`, marginX + 10, clauseBoxY + 16);

    // Risk badge
    doc.setFillColor(...riskBadgeBg);
    doc.roundedRect(pageWidth - marginX - 86, clauseBoxY + 4, 76, 16, 3, 3, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(...riskBadgeText);
    doc.text(riskBadgeLabel, pageWidth - marginX - 48, clauseBoxY + 15, { align: 'center' });

    // Original snippet block
    if (origSnippetLines.length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX + 10, origBoxY, contentWidth - 20, origBoxH, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('ORIGINAL CONTRACT EXCERPT:', marginX + 14, origBoxY + 9);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(origSnippetLines, marginX + 14, origBoxY + 20);
    }

    // Plain English block
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(marginX + 10, plainBoxY, contentWidth - 20, plainBoxH, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text('WHAT THIS MEANS IN PLAIN ENGLISH:', marginX + 14, plainBoxY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(plainLines, marginX + 14, plainBoxY + 21);

    // Potential Risk block
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(marginX + 10, riskBoxY, contentWidth - 20, riskBoxH, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(153, 27, 27);
    doc.text('POTENTIAL RISKS & WHERE THE CATCH IS:', marginX + 14, riskBoxY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(127, 29, 29);
    doc.text(riskLines, marginX + 14, riskBoxY + 21);

    // Recommended Revision block
    if (revisionLines.length > 0) {
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(marginX + 10, revBoxY, contentWidth - 20, revBoxH, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(55, 48, 163);
      doc.text('RECOMMENDED COUNTER-PROPOSAL / REDLINE:', marginX + 14, revBoxY + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 27, 75);
      doc.text(revisionLines, marginX + 14, revBoxY + 21);
    }

    currentY += totalClauseHeight + 12;
  }

  // -------------------------------------------------------------
  // 5. ACTIONABLE CHECKLIST SECTION
  // -------------------------------------------------------------
  checkPageBreak(90);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 2: ACTIONABLE NEGOTIATION CHECKLIST', marginX, currentY);
  currentY += 12;

  for (let i = 0; i < audit.actionableChecklist.length; i++) {
    const item = audit.actionableChecklist[i];
    const categoryTag = `[${item.category.toUpperCase()}]`;
    const actionLines = doc.splitTextToSize(item.actionText, contentWidth - 50);
    const itemHeight = Math.max(26, actionLines.length * 11.5 + 13);

    checkPageBreak(itemHeight + 6);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, currentY, contentWidth, itemHeight, 3, 3, 'FD');

    // Checkbox box [ ]
    doc.setDrawColor(148, 163, 184);
    doc.roundedRect(marginX + 10, currentY + 6, 12, 12, 2, 2, 'S');

    // Category tag & action text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(categoryTag, marginX + 30, currentY + 15);

    const tagWidth = doc.getTextWidth(categoryTag) + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(actionLines, marginX + 30 + tagWidth, currentY + 15);

    currentY += itemHeight + 6;
  }

  // -------------------------------------------------------------
  // 6. DETECTED LEGAL TERMS (EDUCATIONAL APPENDIX)
  // -------------------------------------------------------------
  const detectedGlossaryIds = identifyDocumentGlossaryTerms(documentText || '', audit.keyClauses);
  const detectedTerms = LEGAL_GLOSSARY.filter((t) => detectedGlossaryIds.has(t.id));

  if (detectedTerms.length > 0) {
    checkPageBreak(100);
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('SECTION 3: KEY LEGAL TERMS FOUND IN THIS AGREEMENT', marginX, currentY);
    currentY += 12;

    for (const gTerm of detectedTerms) {
      const plainLines = doc.splitTextToSize(gTerm.plainEnglish, contentWidth - 24);
      const tipLines = doc.splitTextToSize(`Pro Tip: ${gTerm.negotiationTip}`, contentWidth - 24);
      const gHeight = 26 + plainLines.length * 10.5 + tipLines.length * 10.5;

      checkPageBreak(gHeight + 6);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, currentY, contentWidth, gHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${gTerm.term} (${gTerm.category})`, marginX + 10, currentY + 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(plainLines, marginX + 14, currentY + 24);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(79, 70, 229);
      doc.text(tipLines, marginX + 14, currentY + 24 + plainLines.length * 10.5 + 3);

      currentY += gHeight + 6;
    }
  }

  // -------------------------------------------------------------
  // 7. LEGAL DISCLAIMER
  // -------------------------------------------------------------
  checkPageBreak(60);
  currentY += 10;
  const disclaimerText =
    audit.disclaimer ||
    'Legal Disclaimer: This risk assessment report is generated by ClauseGuard for informational, educational, and negotiation preparation purposes only and does not constitute formal legal counsel. For high-stakes or complex transactions, consult a licensed attorney in your jurisdiction.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 20);
  const discHeight = disclaimerLines.length * 9.5 + 14;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, currentY, contentWidth, discHeight, 4, 4, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(disclaimerLines, marginX + 10, currentY + 11);

  // -------------------------------------------------------------
  // 8. RUNNING FOOTER & PAGE COUNTS ON EVERY PAGE
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running header on pages 2+
    if (i > 1) {
      drawRunningHeader();
    }

    // Running footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(marginX, pageHeight - 26, pageWidth - marginX, pageHeight - 26);

    doc.text('ClauseGuard Legal Risk Auditor • Confidential Report', marginX, pageHeight - 15);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 15, { align: 'right' });
  }

  return doc;
}

/**
 * Generates and downloads the PDF directly in the user's browser.
 */
export async function downloadAuditPdf(
  audit: ClauseGuardAuditResult,
  documentText?: string
): Promise<PdfGenerationResult> {
  const doc = buildAuditPdfDocument(audit, documentText);

  const cleanTitle = (audit.documentTitle || audit.documentType || 'Contract-Audit')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = `ClauseGuard-Risk-Audit-${cleanTitle || 'Report'}.pdf`;

  // Use doc.save in browser
  doc.save(fileName);

  return {
    fileName,
    pageCount: doc.getNumberOfPages(),
  };
}
