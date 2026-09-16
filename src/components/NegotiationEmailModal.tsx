import React, { useState } from 'react';
import { X, Copy, Check, Mail, Sparkles, Send } from 'lucide-react';
import { ClauseGuardAuditResult } from '../types';

interface NegotiationEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: ClauseGuardAuditResult;
}

export const NegotiationEmailModal: React.FC<NegotiationEmailModalProps> = ({
  isOpen,
  onClose,
  audit,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [recipientRole, setRecipientRole] = useState<'Landlord' | 'Client' | 'Provider' | 'Company'>('Landlord');

  if (!isOpen) return null;

  // Filter high-risk and caution clauses
  const flaggedClauses = audit.keyClauses.filter(
    (c) => c.riskLevel === 'HIDDEN_TRAP' || c.riskLevel === 'CAUTION'
  );

  const generateEmailBody = () => {
    const clausesText = flaggedClauses
      .map(
        (c, idx) =>
          `${idx + 1}. **${c.clauseName}**:\n   - *Current terms:* ${c.plainEnglishTranslation}\n   - *Requested modification:* ${
            c.suggestedRevision ||
            'We would like to propose adding mutual reasonable notice and standard industry liability limits.'
          }`
      )
      .join('\n\n');

    return `Subject: Questions & Proposed Clarifications regarding the ${audit.documentTitle || audit.documentType}

Dear ${recipientRole} / Team,

Thank you for sending over the ${audit.documentTitle || audit.documentType}. I am excited about moving forward and have reviewed the draft carefully.

Before finalizing and signing, there are a few specific points and standard protections I would like to clarify and adjust so that the terms are balanced and workable for both parties:

${clausesText}

Would you be open to adjusting these points or incorporating these revisions into an updated draft? I am happy to hop on a quick call or review a redlined version at your convenience.

Thank you very much for your time and understanding.

Best regards,
[Your Name]
[Your Contact Information]`;
  };

  const emailText = generateEmailBody();

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Polite Negotiation Counter-Proposal
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-send template addressing your flagged clauses without conflict
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization bar */}
        <div className="px-5 py-2.5 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs">
          <span className="font-medium text-indigo-900">Address recipient as:</span>
          <div className="flex items-center gap-1">
            {(['Landlord', 'Client', 'Provider', 'Company'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRecipientRole(role)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  recipientRole === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Email content preview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/40">
          <textarea
            readOnly
            value={emailText}
            rows={15}
            className="w-full bg-white p-4 rounded-xl border border-slate-200 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none resize-none font-mono"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{flaggedClauses.length} clauses addressed in this template</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors shadow-2xs"
          >
            {hasCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Negotiation Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
