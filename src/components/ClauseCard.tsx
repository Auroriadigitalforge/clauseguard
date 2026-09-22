import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, Sparkles, BookOpen, Scale } from 'lucide-react';
import { ClauseAuditItem, RiskLevel } from '../types';

interface ClauseCardProps {
  clause: ClauseAuditItem;
  index: number;
  onAskLawyer?: (clause: ClauseAuditItem) => void;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause, index, onAskLawyer }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copiedRevision, setCopiedRevision] = useState(false);

  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'HIDDEN_TRAP':
        return {
          tag: '🔴 HIDDEN TRAP',
          label: 'Predatory / High Risk',
          border: 'border-rose-200 hover:border-rose-300',
          headerBg: 'bg-rose-50/50',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />,
          accentBar: 'bg-rose-500',
        };
      case 'CAUTION':
        return {
          tag: '🟡 CAUTION',
          label: 'Ambiguous / One-Sided',
          border: 'border-amber-200 hover:border-amber-300',
          headerBg: 'bg-amber-50/50',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          accentBar: 'bg-amber-500',
        };
      case 'SAFE':
      default:
        return {
          tag: '🟢 SAFE',
          label: 'Standard / Balanced',
          border: 'border-emerald-200 hover:border-emerald-300',
          headerBg: 'bg-emerald-50/50',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          accentBar: 'bg-emerald-500',
        };
    }
  };

  const config = getRiskConfig(clause.riskLevel);

  const handleCopyRevision = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRevision(true);
    setTimeout(() => setCopiedRevision(false), 2000);
  };

  return (
    <article
      id={`clause-card-${index}`}
      aria-label={`Clause analysis: ${clause.clauseName}`}
      className={`bg-white rounded-xl border ${config.border} shadow-xs transition-all overflow-hidden relative`}
    >
      {/* Top Header */}
      <header className={`p-4 sm:p-5 border-b border-slate-100 ${config.headerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
        <div className="flex items-start sm:items-center gap-2.5">
          <span
            className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0"
            aria-label={`Clause sequence number ${index + 1}`}
          >
            #{index + 1}
          </span>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {clause.clauseName}
          </h4>
        </div>

        {/* Risk Badge & Ask a Lawyer Action */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onAskLawyer && clause.riskLevel !== 'SAFE' && (
            <button
              type="button"
              onClick={() => onAskLawyer(clause)}
              aria-label={`Open legal consultation questions for ${clause.clauseName}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="View common probing questions an attorney would ask about this clause"
            >
              <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
              <span>Lawyer Questions</span>
            </button>
          )}

          <span
            role="status"
            aria-label={`Risk level rating: ${config.label}`}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${config.badgeClass}`}
          >
            {config.icon}
            <span>{config.tag}</span>
          </span>
        </div>
      </header>

      {/* Body: Translation & Risk Analysis */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* What it says (Legalese translation) */}
        <section aria-labelledby={`clause-translation-title-${index}`}>
          <div
            id={`clause-translation-title-${index}`}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>What it says (Legalese translation)</span>
          </div>
          <div className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/70">
            {clause.plainEnglishTranslation}
          </div>
        </section>

        {/* Why it matters / Potential Risk */}
        <section aria-labelledby={`clause-risk-title-${index}`}>
          <div
            id={`clause-risk-title-${index}`}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            <span className="text-sm" aria-hidden="true">⚠️</span>
            <span>Why it matters / Potential Risk</span>
          </div>
          <div
            className={`text-sm leading-relaxed p-3.5 rounded-lg border ${
              clause.riskLevel === 'HIDDEN_TRAP'
                ? 'bg-rose-50/60 border-rose-200 text-rose-950 font-medium'
                : clause.riskLevel === 'CAUTION'
                ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
            }`}
          >
            {clause.potentialRisk}
          </div>
        </section>

        {/* Suggested Revision (for Hidden Traps & Caution) */}
        {clause.suggestedRevision && (
          <section className="pt-1" aria-labelledby={`clause-revision-title-${index}`}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                id={`clause-revision-title-${index}`}
                className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                <span>Proposed Counter-Language / Negotiation Fix</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyRevision(clause.suggestedRevision!)}
                aria-label={`Copy suggested counter-language for ${clause.clauseName}`}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-0.5 px-2 rounded hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
                title="Copy suggested revision clause"
              >
                {copiedRevision ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span>Copy Fix</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-indigo-950 font-mono bg-indigo-50/50 p-3 rounded-lg border border-indigo-200/80 leading-relaxed">
              "{clause.suggestedRevision}"
            </div>
          </section>
        )}

        {/* Original Contract Snippet Accordion */}
        {clause.originalSnippet && (
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              aria-expanded={showOriginal}
              aria-controls={`snippet-${index}`}
              aria-label={showOriginal ? `Hide original text for ${clause.clauseName}` : `Show original text for ${clause.clauseName}`}
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-800 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400 rounded"
            >
              <span>{showOriginal ? 'Hide original contract text' : 'View original contract text snippet'}</span>
              {showOriginal ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
            </button>
            {showOriginal && (
              <div
                id={`snippet-${index}`}
                role="region"
                aria-label={`Original contract excerpt for ${clause.clauseName}`}
                className="mt-2 p-3 bg-slate-100/80 rounded-lg text-xs font-mono text-slate-600 border border-slate-200/70 leading-relaxed whitespace-pre-wrap"
              >
                {clause.originalSnippet}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
