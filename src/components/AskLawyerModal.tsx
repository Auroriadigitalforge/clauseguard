import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { ClauseAuditItem, ClauseGuardAuditResult } from '../types';

interface AskLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: ClauseGuardAuditResult;
  initialSelectedClause?: ClauseAuditItem | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  topicTitle?: string;
  content: string;
  suggestedQuestionsForLawyer?: string[];
  counterpartyQuestions?: string[];
  whatLawyerWillAskYou?: string[];
  docsToBring?: string[];
}

/**
 * Returns intelligent attorney inquiry guidance based on clause name and keywords.
 */
function getAttorneyInquiryForClause(clause: ClauseAuditItem) {
  const name = clause.clauseName.toLowerCase();
  const text = `${clause.clauseName} ${clause.plainEnglishTranslation} ${clause.potentialRisk}`.toLowerCase();

  if (name.includes('indemn') || text.includes('indemnif') || text.includes('hold harmless')) {
    return {
      category: 'Indemnification & Third-Party Claims',
      summary: 'Broad indemnities shift financial liability for lawsuits, damages, and legal defense costs onto you.',
      whatLawyerWillAskYou: [
        'Do you hold professional liability or commercial general liability (CGL) insurance that would cover this indemnification scope?',
        'Does the indemnity trigger on mere allegations of breach, or only upon final, non-appealable judicial adjudication?',
        'Have you ever had a previous dispute or third-party claim arising from similar services?',
      ],
      counterpartyQuestions: [
        'Will you agree to make the indemnification mutual so that both parties are equally protected?',
        'Can we insert an express exclusion for claims arising from your own negligence or willful misconduct?',
        'Can we cap indemnification liability to the total fees paid under this agreement over the preceding 12 months?',
      ],
      legalIssues: [
        'Scope of indemnity (direct party-to-party claims vs. true third-party claims).',
        'Duty to defend vs. duty to indemnify (defense costs can exceed underlying damages).',
        'Enforceability of indemnifying against gross negligence under local public policy.',
      ],
      docsToBring: [
        'Current business/personal liability insurance declaration pages',
        'Statements of Work or specifications detailing the exact scope of deliverables',
        'Email communications regarding who requested the indemnification clause',
      ],
    };
  }

  if (name.includes('renewal') || text.includes('auto-renew') || text.includes('notice period') || text.includes('evergreen')) {
    return {
      category: 'Automatic Renewal & Cancellation Traps',
      summary: 'Automatic renewal clauses lock you into successive terms with financial penalties if missed by even one day.',
      whatLawyerWillAskYou: [
        'What is your target notice deadline date on your calendar, and what method of delivery is specified?',
        'Has the counterparty sent you any written reminder notice prior to the renewal window closing?',
        'Do you intend to continue using these services, or do you need an immediate exit strategy?',
      ],
      counterpartyQuestions: [
        'Will you agree to an affirmative written renewal (opt-in) rather than an automatic evergreen extension?',
        'Can the cancellation notice window be shortened from 60/90 days down to a standard 30-day notice period?',
        'Can notice of termination be validly delivered via standard email rather than registered certified postal mail?',
      ],
      legalIssues: [
        'Compliance with state Automatic Renewal Laws (ARL) requiring conspicuous disclosure and advance written reminder notices.',
        'Whether the penalty for late notice constitutes an unenforceable liquidated damages penalty.',
        'Burden of proof for delivery of termination notice.',
      ],
      docsToBring: [
        'Original executed agreement and all subsequent invoices',
        'Email thread showing when the contract was signed and any renewal reminders',
        'Proof of any cancellation attempt or inquiry already submitted',
      ],
    };
  }

  if (name.includes('arbitrat') || text.includes('dispute') || text.includes('venue') || text.includes('jurisdiction') || text.includes('class action')) {
    return {
      category: 'Dispute Resolution, Forum & Arbitration',
      summary: 'Mandatory arbitration and distant venue clauses deprive you of public court jury trials and create high forum expenses.',
      whatLawyerWillAskYou: [
        'Are you able and willing to travel out of state or pay out-of-state counsel fees if a dispute arises?',
        'What is the estimated monetary value of your contract or potential damages in a worst-case scenario?',
        'Does the arbitration clause designate commercial rules (AAA/JAMS) where initial administrative filing fees exceed thousands of dollars?',
      ],
      counterpartyQuestions: [
        'Can venue and governing law be designated in the state where the services or real property are actually located?',
        'Will you agree to add a mandatory 30-day informal mediation or executive negotiation step before filing formal arbitration?',
        'Will each party bear its own arbitration costs, or does the contract mandate that the loser pays attorney fees?',
      ],
      legalIssues: [
        'Enforceability of out-of-state forum selection clauses in consumer or employment contexts.',
        'Unconscionability of class action waivers and one-sided fee shifting provisions.',
        'Cost-prohibitive arbitration rules effectively denying meaningful access to dispute resolution.',
      ],
      docsToBring: [
        'Full contract including standard terms of service referenced by hyperlink',
        'Physical location/residence records showing where the contract was executed and performed',
      ],
    };
  }

  if (name.includes('intellectual') || name.includes('ip') || text.includes('work for hire') || text.includes('copyright') || text.includes('assignment')) {
    return {
      category: 'Intellectual Property Ownership & Assignment',
      summary: 'Overreaching IP assignments can inadvertently forfeit your background tools, open-source code, or pre-existing proprietary assets.',
      whatLawyerWillAskYou: [
        'Did you use any pre-existing code, design templates, frameworks, or libraries in creating the deliverables?',
        'Is full payment condition precedent to the IP transfer, or does ownership transfer automatically upon creation?',
        'Does the agreement attempt to capture inventions you develop outside of working hours or outside contract scope?',
      ],
      counterpartyQuestions: [
        'Can we explicitly carve out background IP, pre-existing tools, and generic know-how in Schedule A?',
        'Will you agree that ownership assigns only upon receipt of full and final compensation for the corresponding milestone?',
        'Can the client receive a perpetual, non-exclusive license rather than an outright global assignment of all underlying IP?',
      ],
      legalIssues: [
        'Statutory Work-Made-For-Hire requirements under Section 101 of the US Copyright Act.',
        'Validity of moral rights waivers and power-of-attorney assignment covenants.',
        'Risk of breach when third-party open-source components are embedded without disclosure.',
      ],
      docsToBring: [
        'Repository or documentation showing pre-existing code/tools developed prior to engagement',
        'Invoices and proof of milestone payments received to date',
      ],
    };
  }

  if (name.includes('liability') || text.includes('consequential') || text.includes('limitation of liability') || text.includes('cap')) {
    return {
      category: 'Limitation of Liability & Damage Caps',
      summary: 'Asymmetric liability caps protect the counterparty from major damages while leaving you exposed to unlimited claims.',
      whatLawyerWillAskYou: [
        'What is the maximum realistic financial harm either party could suffer if the other completely defaults?',
        'Does the limitation of liability cap damages to fees paid, and does it apply equally to both sides?',
        'Are critical obligations (like data breaches, confidentiality, or IP infringement) excluded from the liability cap?',
      ],
      counterpartyQuestions: [
        'Can the limitation of liability cap be made strictly mutual at 1x or 2x total contract value?',
        'Can we carve out gross negligence, intentional misconduct, and confidentiality breaches from the cap?',
        'Will you agree that neither party will be liable for indirect, punitive, or consequential damages?',
      ],
      legalIssues: [
        'Enforceability of liability limitations that exculpate intentional or reckless harm under state law.',
        'Economic loss doctrine and consequential lost-profit damage exclusions.',
        'Alignment between liability caps and required commercial insurance coverage amounts.',
      ],
      docsToBring: [
        'Project budget and fee schedule',
        'Risk assessment of client data or property handled during the engagement',
      ],
    };
  }

  if (name.includes('deposit') || name.includes('fee') || text.includes('liquidated') || text.includes('penalty') || text.includes('late')) {
    return {
      category: 'Deposits, Deductions & Liquidated Damages',
      summary: 'Vague forfeiture provisions and fixed liquidated damages can operate as punitive, unlawful financial penalties.',
      whatLawyerWillAskYou: [
        'Did the counterparty provide a detailed itemized accounting and receipts for any deductions or charges?',
        'Is the liquidated damages figure reasonably related to actual anticipated administrative losses?',
        'What does local statutory law (e.g., civil code limits on security deposits) mandate in your city or county?',
      ],
      counterpartyQuestions: [
        'Will you specify a mandatory 21-day timeline with itemized receipts for any deposit deductions or repairs?',
        'Can late fees be bounded by a 5-day grace period and capped at a maximum of 5% of the overdue balance?',
        'Will security deposits be held in a segregated, interest-bearing escrow account as required by statute?',
      ],
      legalIssues: [
        'Distinction between valid liquidated damages and unenforceable contractual penalties under the Restatement (Second) of Contracts.',
        'Strict statutory penalties (treble damages) for bad-faith deposit withholding under residential tenant protection laws.',
        'Usury and statutory caps on interest and late payment fees.',
      ],
      docsToBring: [
        'Original move-in/commencement inspection checklist with timestamped photos',
        'Bank records showing exact security deposit or retainer payment cleared',
        'Written communications requesting accounting or refund of funds',
      ],
    };
  }

  // Fallback generic guidance
  return {
    category: 'General Contractual Obligation & Risk',
    summary: `Risk review regarding "${clause.clauseName}": ${clause.potentialRisk.slice(0, 120)}...`,
    whatLawyerWillAskYou: [
      `What was your original commercial understanding of "${clause.clauseName}" during initial discussions?`,
      'Do you have any contemporaneous emails, Slack messages, or text notes where the other party explained this clause?',
      'Has either party already performed any obligations or waived any formalities under this clause?',
    ],
    counterpartyQuestions: [
      `Can we add clarification language to ensure "${clause.clauseName}" operates reasonably for both parties?`,
      'Would you be willing to adopt the balanced counter-proposal language proposed in our redline draft?',
      'Can we add a requirement for written notice and a 15-day cure period before any breach can be declared?',
    ],
    legalIssues: [
      'Ambiguity in contractual drafting interpreted against the drafter (contra proferentem doctrine).',
      'Implied covenant of good faith and fair dealing applicable under common law.',
      'Materiality of breach and adequacy of cure provisions.',
    ],
    docsToBring: [
      'The entire executed or proposed agreement with all exhibits and addenda',
      'Complete pre-contract communication history relating to this specific requirement',
    ],
  };
}

export const AskLawyerModal: React.FC<AskLawyerModalProps> = ({
  isOpen,
  onClose,
  audit,
  initialSelectedClause = null,
}) => {
  // Flagged clauses only (Hidden traps and Cautions)
  const flaggedClauses = useMemo(
    () => audit.keyClauses.filter((c) => c.riskLevel === 'HIDDEN_TRAP' || c.riskLevel === 'CAUTION'),
    [audit.keyClauses]
  );

  const [activeClauseId, setActiveClauseId] = useState<string>(
    initialSelectedClause?.id || (flaggedClauses.length > 0 ? flaggedClauses[0].id : 'all')
  );

  const activeClause = useMemo(
    () => flaggedClauses.find((c) => c.id === activeClauseId) || flaggedClauses[0] || null,
    [flaggedClauses, activeClauseId]
  );

  const clauseInquiry = useMemo(
    () => (activeClause ? getAttorneyInquiryForClause(activeClause) : null),
    [activeClause]
  );

  const [inputQuery, setInputQuery] = useState('');
  const [hasCopiedPrepSheet, setHasCopiedPrepSheet] = useState(false);

  // Initial simulated Q&A messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const firstClause = initialSelectedClause || flaggedClauses[0] || audit.keyClauses[0];
    const initialInq = firstClause ? getAttorneyInquiryForClause(firstClause) : null;

    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        timestamp: 'Just now',
        topicTitle: 'Attorney Consultation Framework',
        content: `Welcome to the Consultation Prep Assistant. While ClauseGuard cannot provide legal advice or form an attorney-client relationship, I can equip you with the precise inquiries and scrutiny a contract attorney will apply to your document.

We have detected ${flaggedClauses.length} flagged clause(s) with elevated legal risk. Select any clause below or ask a specific question to preview the questions a lawyer would ask.`,
        whatLawyerWillAskYou: initialInq?.whatLawyerWillAskYou || [
          'What were the verbal promises made prior to this written agreement?',
          'What is your financial exposure if the counterparty terminates early?',
        ],
        counterpartyQuestions: initialInq?.counterpartyQuestions || [
          'Can we make this obligation mutual between both parties?',
          'Can we insert a standard 30-day notice and cure period?',
        ],
        docsToBring: initialInq?.docsToBring || [
          'Complete signed agreement and all exhibits',
          'Past invoices and communication trail',
        ],
      },
    ];
  });

  if (!isOpen) return null;

  const handleSelectClause = (clauseId: string) => {
    setActiveClauseId(clauseId);
    const targetClause = flaggedClauses.find((c) => c.id === clauseId);
    if (!targetClause) return;

    const inq = getAttorneyInquiryForClause(targetClause);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: 'Just now',
      topicTitle: `Inquiry Scope: ${targetClause.clauseName}`,
      content: `Here is the legal consultation framework an attorney would apply to the "${targetClause.clauseName}":\n\n${inq.summary}`,
      whatLawyerWillAskYou: inq.whatLawyerWillAskYou,
      counterpartyQuestions: inq.counterpartyQuestions,
      docsToBring: inq.docsToBring,
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendCustomQuery = (customText?: string) => {
    const query = (customText || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      content: query,
    };

    // Synthesize intelligent attorney consultation response
    const matchedClause =
      flaggedClauses.find((c) => query.toLowerCase().includes(c.clauseName.toLowerCase().slice(0, 8))) ||
      activeClause ||
      flaggedClauses[0];

    const inq = matchedClause ? getAttorneyInquiryForClause(matchedClause) : null;

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now() + 1}`,
      sender: 'assistant',
      timestamp: 'Just now',
      topicTitle: `Consultation Analysis: "${query.slice(0, 40)}${query.length > 40 ? '...' : ''}"`,
      content: `Non-legal consultation guidance: When addressing "${query}", a licensed contract attorney will examine the interplay between state statutory protections and explicit contractual wording.

Here is how counsel will break down this question during your consultation:`,
      whatLawyerWillAskYou: [
        `Has this scenario occurred yet, or are you proactively mitigating risk prior to signing?`,
        `Are there any written email modifications or side agreements touching on this point?`,
        ...(inq ? inq.whatLawyerWillAskYou.slice(0, 2) : []),
      ],
      counterpartyQuestions: [
        `Would you agree to clarify this term using standard American Bar Association or industry-neutral language?`,
        ...(inq ? inq.counterpartyQuestions.slice(0, 2) : []),
      ],
      docsToBring: inq?.docsToBring || [
        'Full PDF contract draft',
        'Timeline of negotiations and emails',
      ],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputQuery('');
  };

  // Compile full Consultation Preparation Sheet for clipboard
  const handleCopyPrepSheet = () => {
    const docTitle = audit.documentTitle || audit.documentType || 'Contract';
    const lines: string[] = [];

    lines.push(`========================================================================`);
    lines.push(`CLAUSEGUARD ATTORNEY CONSULTATION PREPARATION SHEET`);
    lines.push(`Document: ${docTitle}`);
    lines.push(`Audited Date: ${new Date(audit.analyzedAt || Date.now()).toLocaleDateString()}`);
    lines.push(`Fairness Score: ${audit.fairnessScore}/100 (${audit.scoreLabel})`);
    lines.push(`Notice: For educational consultation preparation only. Not formal legal advice.`);
    lines.push(`========================================================================\n`);

    lines.push(`1. EXECUTIVE SUMMARY & EXPOSURE`);
    lines.push(`${audit.executiveSummary}\n`);

    lines.push(`2. KEY QUESTIONS TO ASK YOUR ATTORNEY`);
    flaggedClauses.forEach((c, idx) => {
      const inq = getAttorneyInquiryForClause(c);
      lines.push(`\n[Clause ${idx + 1}: ${c.clauseName.toUpperCase()}]`);
      lines.push(`- Risk Rating: ${c.riskLevel}`);
      lines.push(`- Plain English Meaning: ${c.plainEnglishTranslation}`);
      lines.push(`- Potential Trap: ${c.potentialRisk}`);
      lines.push(`\n* Questions Your Lawyer Will Ask You:`);
      inq.whatLawyerWillAskYou.forEach((q) => lines.push(`  • ${q}`));
      lines.push(`* Questions to Propose to the Counterparty:`);
      inq.counterpartyQuestions.forEach((q) => lines.push(`  • ${q}`));
      lines.push(`* Key Legal Issues / Doctrines:`);
      inq.legalIssues.forEach((i) => lines.push(`  • ${i}`));
      if (c.suggestedRevision) {
        lines.push(`* Suggested Counter-Revision: "${c.suggestedRevision}"`);
      }
    });

    lines.push(`\n3. EVIDENCE & DOCUMENTS TO BRING TO YOUR CONSULTATION`);
    lines.push(`• Complete unedited contract draft with all addenda and exhibits`);
    lines.push(`• Email trail and negotiation notes detailing verbal representations`);
    lines.push(`• Proof of any milestone payments, deposits, or notices exchanged to date`);
    lines.push(`• Any relevant insurance declarations or certificates`);

    lines.push(`\n========================================================================`);
    lines.push(`Generated by ClauseGuard Legal Risk Auditor • Confidential`);

    navigator.clipboard.writeText(lines.join('\n'));
    setHasCopiedPrepSheet(true);
    setTimeout(() => setHasCopiedPrepSheet(false), 2500);
  };

  return (
    <div
      id="ask-lawyer-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="ask-lawyer-modal-container"
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  Ask a Lawyer (Consultation Prep)
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Educational Simulation
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Common probing questions and strategic frameworks an attorney would raise about your contract
              </p>
            </div>
          </div>

          <button
            id="btn-close-ask-lawyer-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Disclaimer Callout Banner */}
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200/90 text-amber-950 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-900">Disclaimer: Cannot Provide Legal Advice.</strong>{' '}
            ClauseGuard is an AI contract analysis tool and does not provide legal advice, legal opinions, or legal representation. No attorney-client relationship is created. Use this interactive simulation to prepare strategic questions for a licensed attorney in your jurisdiction.
          </div>
        </div>

        {/* Clause Switcher Bar */}
        {flaggedClauses.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-slate-600 shrink-0 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Flagged Clauses:</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {flaggedClauses.map((clause, idx) => {
                const isActive = clause.id === activeClauseId;
                const isTrap = clause.riskLevel === 'HIDDEN_TRAP';
                return (
                  <button
                    key={clause.id}
                    type="button"
                    onClick={() => handleSelectClause(clause.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isTrap
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                        : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>#{idx + 1} {clause.clauseName.slice(0, 24)}{clause.clauseName.length > 24 ? '...' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Q&A Interactive Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="max-w-[85%] bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs sm:text-sm leading-relaxed">
                  <div className="font-semibold text-[11px] text-indigo-200 mb-1">Your Question:</div>
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[95%] sm:max-w-[90%] bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl rounded-tl-xs shadow-xs space-y-4 text-slate-800">
                  {/* Topic Title */}
                  {msg.topicTitle && (
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {msg.topicTitle}
                      </span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Probing Questions for Counterparty */}
                  {msg.counterpartyQuestions && msg.counterpartyQuestions.length > 0 && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Questions a Lawyer Would Advise You to Ask the Counterparty:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-amber-950">
                        {msg.counterpartyQuestions.map((q, qIdx) => (
                          <li key={qIdx} className="flex items-start gap-2">
                            <span className="font-bold text-amber-700 shrink-0 mt-0.5">•</span>
                            <span className="font-medium">"{q}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What a Lawyer Will Ask YOU */}
                  {msg.whatLawyerWillAskYou && msg.whatLawyerWillAskYou.length > 0 && (
                    <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Questions Your Lawyer Will Ask YOU in a Consultation:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-indigo-900">
                        {msg.whatLawyerWillAskYou.map((q, qIdx) => (
                          <li key={qIdx} className="flex items-start gap-2">
                            <span className="font-bold text-indigo-600 shrink-0 mt-0.5">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Documents & Records to Bring */}
                  {msg.docsToBring && msg.docsToBring.length > 0 && (
                    <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        <FileQuestion className="w-3.5 h-3.5 text-slate-600" />
                        <span>Evidence & Documents to Bring to Your Lawyer:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.docsToBring.map((docItem, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {docItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Suggested Quick Prompt Prompts */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Suggested Questions a Lawyer Would Investigate:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Is this liability limitation enforceable in my state?',
                'Can the counterparty cancel without giving me notice?',
                'What happens if I refuse to sign this indemnification?',
                'Does the arbitration clause waive my right to join a class action?',
                'How can I negotiate a 30-day cure period for default?',
              ].map((promptText, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSendCustomQuery(promptText)}
                  className="text-xs bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar for Asking Questions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCustomQuery();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                id="input-ask-lawyer-query"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about a clause (e.g. 'Can they keep my deposit?' or 'Is this non-compete valid?')..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <button
              id="btn-submit-lawyer-query"
              type="submit"
              disabled={!inputQuery.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span>Consultation Q&A framework covering {flaggedClauses.length} flagged terms</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-copy-consultation-sheet"
              type="button"
              onClick={handleCopyPrepSheet}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Copy complete list of questions and evidence checklist to bring to your consultation"
            >
              {hasCopiedPrepSheet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied Prep Sheet!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Consultation Questions Sheet</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
