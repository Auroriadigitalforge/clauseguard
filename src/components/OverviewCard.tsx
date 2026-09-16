import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, FileText, Download, Copy, Mail, Sparkles, Scale } from 'lucide-react';
import { ClauseGuardAuditResult } from '../types';

interface OverviewCardProps {
  audit: ClauseGuardAuditResult;
  onOpenMarkdownModal: () => void;
  onOpenNegotiationModal: () => void;
  onOpenAskLawyer: () => void;
  onCopyReport: () => void;
  hasCopied: boolean;
  onDownloadPdf?: () => void;
  isGeneratingPdf?: boolean;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  audit,
  onOpenMarkdownModal,
  onOpenNegotiationModal,
  onOpenAskLawyer,
  onCopyReport,
  hasCopied,
  onDownloadPdf,
  isGeneratingPdf = false,
}) => {
  const { fairnessScore, documentType, executiveSummary, keyClauses, scoreLabel } = audit;

  const trapsCount = keyClauses.filter((c) => c.riskLevel === 'HIDDEN_TRAP').length;
  const cautionCount = keyClauses.filter((c) => c.riskLevel === 'CAUTION').length;
  const safeCount = keyClauses.filter((c) => c.riskLevel === 'SAFE').length;

  // Compute color theme based on fairnessScore
  const getScoreTheme = (score: number) => {
    if (score < 50) {
      return {
        text: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        ring: 'stroke-rose-500',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        label: scoreLabel || 'Critical Legal Risk',
      };
    }
    if (score < 75) {
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'stroke-amber-500',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        label: scoreLabel || 'Caution Advised',
      };
    }
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      ring: 'stroke-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: scoreLabel || 'Fair & Balanced',
    };
  };

  const theme = getScoreTheme(fairnessScore);

  // Circular gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fairnessScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 relative overflow-hidden">
      {/* Top Bar with Document Type & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 1 • Document Overview
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{audit.documentTitle || documentType}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {documentType}
            </span>
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onDownloadPdf && (
            <button
              id="btn-download-pdf-report"
              type="button"
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate and download full printable PDF report"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          )}

          <button
            id="btn-copy-report-markdown"
            type="button"
            onClick={onCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Copy exact markdown report"
          >
            {hasCopied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            id="btn-view-raw-markdown"
            type="button"
            onClick={onOpenMarkdownModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Markdown View</span>
          </button>

          <button
            id="btn-ask-a-lawyer"
            type="button"
            onClick={onOpenAskLawyer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 transition-colors shadow-2xs cursor-pointer"
            title="Ask a Lawyer: Review common probing questions an attorney would ask about the flagged clauses"
          >
            <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Ask a Lawyer</span>
          </button>

          <button
            id="btn-negotiate-email"
            type="button"
            onClick={onOpenNegotiationModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Negotiation Script</span>
          </button>
        </div>
      </div>

      {/* Main Score & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
        {/* Fairness Score Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-50/70 border border-slate-100">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="9"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`${theme.ring} transition-all duration-1000 ease-out`}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold ${theme.text} tracking-tight`}>
                {fairnessScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${theme.badgeBg}`}
            >
              {theme.label}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">
              100 = completely fair • 0 = extreme risk
            </p>
          </div>
        </div>

        {/* Executive Summary & Stratified Metrics */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Executive Summary
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {executiveSummary}
            </p>
          </div>

          {/* Clause Stratification Breakdown Cards */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {/* Hidden Traps */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <div className="flex items-center gap-1.5 text-rose-700 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold">Hidden Traps</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-rose-700">{trapsCount}</span>
                  <span className="text-[11px] text-rose-600/80 font-medium">high-risk</span>
                </div>
              </div>

              {/* Caution */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold">Caution</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-amber-700">{cautionCount}</span>
                  <span className="text-[11px] text-amber-600/80 font-medium">watch closely</span>
                </div>
              </div>

              {/* Safe */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold">Safe Terms</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-700">{safeCount}</span>
                  <span className="text-[11px] text-emerald-600/80 font-medium">standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
