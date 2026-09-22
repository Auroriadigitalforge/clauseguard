import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { ActionableChecklistItem } from '../types';

interface ChecklistSectionProps {
  checklist: ActionableChecklistItem[];
  disclaimer: string;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ checklist, disclaimer }) => {
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});
  const [hasCopied, setHasCopied] = useState(false);

  const toggleItem = (idx: number) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalCount = checklist.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCopyChecklist = () => {
    const text = checklist
      .map((item, i) => `${completedItems[i] ? '[x]' : '[ ]'} ${item.actionText}`)
      .join('\n');
    navigator.clipboard.writeText(`CLAUSEGUARD ACTIONABLE CHECKLIST:\n\n${text}`);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <section
      aria-labelledby="section-checklist-title"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6"
    >
      {/* Header with completion counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Section 3 • Actionable Checklist & Next Steps
          </span>
          <h3 id="section-checklist-title" className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Pre-Signing Action Plan & Negotiation Questions
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Specific points to clarify, modify, or strike out before putting pen to paper.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Pill */}
          <div
            role="status"
            aria-label={`${completedCount} of ${totalCount} action checklist items completed`}
            className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
          >
            <span className="font-semibold text-slate-700">
              {completedCount} of {totalCount} Addressed
            </span>
            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden" aria-hidden="true">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyChecklist}
            aria-label="Copy entire actionable checklist to clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>Copy Checklist</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3" role="list" aria-label="Action plan steps">
        {checklist.map((item, idx) => {
          const isDone = !!completedItems[idx];
          return (
            <div
              key={item.id || idx}
              role="listitem"
              onClick={() => toggleItem(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleItem(idx);
                }
              }}
              tabIndex={0}
              aria-label={`${isDone ? 'Completed' : 'Pending'}: ${item.actionText}`}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-600'
                  : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-800'
              }`}
            >
              <div
                role="checkbox"
                aria-checked={isDone}
                tabIndex={-1}
                aria-label={`Mark "${item.actionText}" as ${isDone ? 'incomplete' : 'complete'}`}
                className="mt-0.5 text-emerald-600 focus:outline-none shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" aria-hidden="true" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium leading-relaxed ${
                    isDone ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {item.actionText}
                </p>
                {item.category && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Guardrail Disclaimer */}
      <aside aria-label="Legal disclaimer" className="pt-4 border-t border-slate-100">
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-bold text-amber-950 mb-0.5">Disclaimer</h4>
            <p className="italic text-amber-900/90 font-serif">
              {disclaimer ||
                'Reminder: This analysis is generated by ClauseGuard for informational and preparation purposes only and does not constitute formal legal advice.'}
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
};
