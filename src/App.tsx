import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DocumentUploader } from './components/DocumentUploader';
import { OverviewCard } from './components/OverviewCard';
import { ClauseCard } from './components/ClauseCard';
import { ChecklistSection } from './components/ChecklistSection';
import { LegalGlossary } from './components/LegalGlossary';
import { MarkdownReportModal } from './components/MarkdownReportModal';
import { NegotiationEmailModal } from './components/NegotiationEmailModal';
import { SAMPLE_CONTRACTS } from './data/sampleContracts';
import { ClauseGuardAuditResult, RiskLevel } from './types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowUp,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  FileCheck,
  Download,
} from 'lucide-react';
import { AskLawyerModal } from './components/AskLawyerModal';
import { ClauseAuditItem } from './types';

export default function App() {
  const [targetAudience, setTargetAudience] = useState<string>('Consumer');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentText, setDocumentText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [auditResult, setAuditResult] = useState<ClauseGuardAuditResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState<boolean>(false);
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState<boolean>(false);
  const [isAskLawyerOpen, setIsAskLawyerOpen] = useState<boolean>(false);
  const [selectedClauseForLawyer, setSelectedClauseForLawyer] = useState<ClauseAuditItem | null>(null);
  const [hasCopiedReport, setHasCopiedReport] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfDownloadFeedback, setPdfDownloadFeedback] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const loadingSteps = [
    'Scanning legal syntax & jurisdictional clauses...',
    'Detecting predatory traps, penalties & hidden liabilities...',
    'Translating legalese into plain-English protections...',
    'Computing Fairness Score & generating actionable checklist...',
  ];

  // Animated loading step interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Load sample contract
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_CONTRACTS.find((s) => s.id === sampleId);
    if (sample) {
      setDocumentTitle(sample.title);
      setDocumentText(sample.text);
      setUploadedFileName(null);
      setFileBase64(null);
      setFileMimeType(null);
      setTargetAudience(sample.targetAudience);
      setErrorMessage(null);
      setAuditResult(null);
    }
  };

  // Handle uploaded file
  const handleFileLoaded = (fileData: {
    base64?: string;
    mimeType?: string;
    name: string;
    text?: string;
  }) => {
    setUploadedFileName(fileData.name);
    if (fileData.base64) {
      setFileBase64(fileData.base64);
      setFileMimeType(fileData.mimeType || 'application/pdf');
    } else {
      setFileBase64(null);
      setFileMimeType(null);
    }
    if (fileData.text) {
      setDocumentText(fileData.text);
    }
    setErrorMessage(null);
  };

  const handleClear = () => {
    setDocumentText('');
    setDocumentTitle('');
    setUploadedFileName(null);
    setFileBase64(null);
    setFileMimeType(null);
    setErrorMessage(null);
    setAuditResult(null);
  };

  // Run audit via backend
  const handleRunAudit = async () => {
    if (!documentText.trim() && !fileBase64) {
      setErrorMessage('Please provide document text or upload a contract file first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/audit-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: fileBase64 ? undefined : documentText,
          fileData: fileBase64,
          mimeType: fileMimeType,
          documentName: documentTitle || uploadedFileName || 'Contract Document',
          targetAudience,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Audit failed with status ${response.status}`);
      }

      const data: ClauseGuardAuditResult = await response.json();
      setAuditResult(data);

      // Smooth scroll to report
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Audit failed:', err);
      let msg = err.message || 'Failed to complete legal audit. Please check your document and try again.';
      try {
        const jsonMatch = msg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.error?.message) {
            msg = parsed.error.message;
          }
        }
      } catch (_) {}
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy full markdown report
  const handleCopyReport = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(auditResult.rawMarkdownReport);
    setHasCopiedReport(true);
    setTimeout(() => setHasCopiedReport(false), 2200);
  };

  // Generate and download printable PDF report
  const handleDownloadPdf = async () => {
    if (!auditResult) return;
    try {
      setIsGeneratingPdf(true);
      const { downloadAuditPdf } = await import('./utils/pdfGenerator');
      const result = await downloadAuditPdf(auditResult, documentText);
      setPdfDownloadFeedback(`Saved ${result.fileName} (${result.pageCount} pages)`);
      setTimeout(() => setPdfDownloadFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setErrorMessage(`Failed to export PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Open Ask a Lawyer consultation prep modal
  const handleOpenAskLawyer = (clause?: ClauseAuditItem) => {
    setSelectedClauseForLawyer(clause || null);
    setIsAskLawyerOpen(true);
  };

  // Filter and search clauses
  const filteredClauses = auditResult
    ? auditResult.keyClauses.filter((clause) => {
        const matchesFilter =
          activeFilter === 'ALL' ? true : clause.riskLevel === activeFilter;
        const matchesSearch =
          !searchQuery.trim() ||
          clause.clauseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clause.plainEnglishTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clause.potentialRisk.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
    : [];

  const counts = auditResult
    ? {
        total: auditResult.keyClauses.length,
        traps: auditResult.keyClauses.filter((c) => c.riskLevel === 'HIDDEN_TRAP').length,
        caution: auditResult.keyClauses.filter((c) => c.riskLevel === 'CAUTION').length,
        safe: auditResult.keyClauses.filter((c) => c.riskLevel === 'SAFE').length,
      }
    : { total: 0, traps: 0, caution: 0, safe: 0 };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Header with persona & sample selectors */}
      <Header
        targetAudience={targetAudience}
        onAudienceChange={setTargetAudience}
        onLoadSample={handleLoadSample}
        samples={SAMPLE_CONTRACTS.map((s) => ({ id: s.id, title: s.title, type: s.type }))}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Intro banner */}
        {!auditResult && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Empowering Consumers, Students & Freelancers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Never sign away your rights blindly.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                ClauseGuard audits leases, freelance contracts, gym memberships, and terms of service.
                It flags predatory traps (🔴), highlights ambiguous terms (🟡), validates standard clauses (🟢),
                and delivers plain-English translations and concrete negotiation steps.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 sm:p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950">Notice</h4>
                <p className="mt-0.5 text-rose-800 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Retry Audit
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-2.5 py-1.5 rounded-lg hover:bg-rose-100 text-rose-700 font-medium text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Document Uploader & Input */}
        <DocumentUploader
          documentText={documentText}
          documentTitle={documentTitle}
          onTextChange={setDocumentText}
          onTitleChange={setDocumentTitle}
          onFileLoaded={handleFileLoaded}
          onAudit={handleRunAudit}
          isLoading={isLoading}
          uploadedFileName={uploadedFileName}
          onClear={handleClear}
        />

        {/* Pre-Audit Educational Legal Glossary */}
        {!auditResult && !isLoading && (
          <div className="pt-2 animate-in fade-in duration-200">
            <LegalGlossary
              documentText={documentText}
              defaultOpen={false}
            />
          </div>
        )}

        {/* Loading State with animated legal audit steps */}
        {isLoading && (
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-lg ring-4 ring-emerald-50 animate-pulse">
              <Scale className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Auditing Legal Risk with ClauseGuard
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700 font-medium bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block transition-all">
                {loadingSteps[loadingStepIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Audit Results Report Section */}
        {auditResult && !isLoading && (
          <div ref={reportRef} className="space-y-8 animate-in fade-in duration-300">
            {/* Engine Fallback Notice Banner */}
            {auditResult.engineMode === 'heuristic_engine' && (
              <div className="p-4 sm:p-4.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">
                      Audited via ClauseGuard Built-in Legal Rules Engine
                    </span>
                    <p className="text-amber-800 mt-0.5 leading-relaxed">
                      Generated using ClauseGuard's deterministic risk detection engine while upstream AI models experience peak demand.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRunAudit}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-center shadow-2xs"
                >
                  Re-analyze with AI
                </button>
              </div>
            )}

            {/* Section 1: Overview */}
            <OverviewCard
              audit={auditResult}
              onOpenMarkdownModal={() => setIsMarkdownModalOpen(true)}
              onOpenNegotiationModal={() => setIsNegotiationModalOpen(true)}
              onOpenAskLawyer={() => handleOpenAskLawyer()}
              onCopyReport={handleCopyReport}
              hasCopied={hasCopiedReport}
              onDownloadPdf={handleDownloadPdf}
              isGeneratingPdf={isGeneratingPdf}
            />

            {/* Section 2: Key Clauses & Hidden Traps */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Section 2 • The Risk Audit
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Key Clauses & Hidden Traps
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Categorized by risk level with plain-English translations and hidden catches.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="clause-search-input"
                    type="text"
                    aria-label="Search clauses or terms"
                    placeholder="Search clauses or terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Risk Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  id="filter-all"
                  type="button"
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  All Clauses ({counts.total})
                </button>
                <button
                  id="filter-traps"
                  type="button"
                  onClick={() => setActiveFilter('HIDDEN_TRAP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeFilter === 'HIDDEN_TRAP'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>🔴 Hidden Traps ({counts.traps})</span>
                </button>
                <button
                  id="filter-caution"
                  type="button"
                  onClick={() => setActiveFilter('CAUTION')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeFilter === 'CAUTION'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>🟡 Caution ({counts.caution})</span>
                </button>
                <button
                  id="filter-safe"
                  type="button"
                  onClick={() => setActiveFilter('SAFE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeFilter === 'SAFE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>🟢 Safe ({counts.safe})</span>
                </button>
              </div>

              {/* Clauses List */}
              {filteredClauses.length > 0 ? (
                <div className="space-y-4">
                  {filteredClauses.map((clause, idx) => (
                    <ClauseCard
                      key={clause.id || idx}
                      clause={clause}
                      index={idx}
                      onAskLawyer={handleOpenAskLawyer}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
                  No clauses match your current filter or search criteria.
                </div>
              )}
            </div>

            {/* Section 3: Actionable Checklist & Next Steps + Required Disclaimer */}
            <ChecklistSection
              checklist={auditResult.actionableChecklist}
              disclaimer={auditResult.disclaimer}
            />

            {/* Section 4: Expandable Legal Glossary & Plain-English Dictionary */}
            <LegalGlossary
              documentText={documentText}
              clauses={auditResult.keyClauses}
              defaultOpen={true}
            />

            {/* Re-audit and Top Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Audit completed on {new Date(auditResult.analyzedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-bottom-download-pdf"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Download clean printable PDF version of this assessment"
                >
                  {isGeneratingPdf ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Download Printable PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  id="btn-bottom-ask-lawyer"
                  onClick={() => handleOpenAskLawyer()}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Ask a Lawyer: Consultation questions on flagged clauses"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Ask a Lawyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Back to Top</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Audit Another Contract</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Disclaimer Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-600 font-serif italic max-w-2xl mx-auto">
            Disclaimer: This analysis is generated by ClauseGuard for informational and preparation purposes only
            and does not constitute formal legal advice. Always consult a qualified attorney for specific legal matters.
          </p>
          <p className="text-xs text-slate-600 font-medium">
            ClauseGuard • Built for consumers, students, and freelancers
          </p>
        </div>
      </footer>

      {/* Floating Download Toast Feedback */}
      {pdfDownloadFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pdfDownloadFeedback}</span>
        </div>
      )}

      {/* Markdown Report Modal */}
      {auditResult && (
        <MarkdownReportModal
          isOpen={isMarkdownModalOpen}
          onClose={() => setIsMarkdownModalOpen(false)}
          markdownContent={auditResult.rawMarkdownReport}
          documentTitle={auditResult.documentTitle || auditResult.documentType}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
        />
      )}

      {/* Negotiation Email Modal */}
      {auditResult && (
        <NegotiationEmailModal
          isOpen={isNegotiationModalOpen}
          onClose={() => setIsNegotiationModalOpen(false)}
          audit={auditResult}
        />
      )}

      {/* Ask a Lawyer Consultation Prep Modal */}
      {auditResult && (
        <AskLawyerModal
          isOpen={isAskLawyerOpen}
          onClose={() => setIsAskLawyerOpen(false)}
          audit={auditResult}
          initialSelectedClause={selectedClauseForLawyer}
        />
      )}
    </div>
  );
}
