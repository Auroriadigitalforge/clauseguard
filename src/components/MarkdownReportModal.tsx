import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Code2, Eye } from 'lucide-react';
import Markdown from 'react-markdown';

interface MarkdownReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  documentTitle: string;
  onDownloadPdf?: () => void;
  isGeneratingPdf?: boolean;
}

export const MarkdownReportModal: React.FC<MarkdownReportModalProps> = ({
  isOpen,
  onClose,
  markdownContent,
  documentTitle,
  onDownloadPdf,
  isGeneratingPdf = false,
}) => {
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClauseGuard-Audit-${documentTitle.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="markdown-report-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <header className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <h3 id="markdown-report-modal-title" className="font-bold text-slate-900 text-base sm:text-lg">
              ClauseGuard Assessment Report (Markdown)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div role="tablist" aria-label="Report format mode" className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'rendered'}
                onClick={() => setViewMode('rendered')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 ${
                  viewMode === 'rendered'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Rendered</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'raw'}
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 ${
                  viewMode === 'raw'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Raw Markdown</span>
              </button>
            </div>

            {onDownloadPdf && (
              <button
                type="button"
                id="modal-download-pdf-btn"
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                aria-label="Download assessment report as PDF document"
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Download as clean printable PDF"
              >
                {isGeneratingPdf ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy markdown report text to clipboard"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="Copy Markdown"
            >
              {hasCopied ? (
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              aria-label="Download markdown source file"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
              title="Download .md file"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close report modal"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/40">
          {viewMode === 'rendered' ? (
            <div className="max-w-none text-slate-800 space-y-4 text-sm leading-relaxed">
              <Markdown>{markdownContent}</Markdown>
            </div>
          ) : (
            <pre className="font-mono text-xs text-slate-800 bg-white p-5 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {markdownContent}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Formatted according to ClauseGuard Legal Audit Specification</span>
          <div className="flex items-center gap-2">
            {onDownloadPdf && (
              <button
                type="button"
                id="modal-footer-download-pdf-btn"
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-white" />
                )}
                <span>Download Printable PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
            >
              {hasCopied ? 'Copied to Clipboard!' : 'Copy Full Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
