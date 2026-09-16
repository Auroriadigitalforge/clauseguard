import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
  FileText,
  Copy,
  Check,
  Filter,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import {
  LEGAL_GLOSSARY,
  GLOSSARY_CATEGORIES,
  GlossaryCategory,
  GlossaryTerm,
  identifyDocumentGlossaryTerms,
} from '../data/legalGlossaryData';
import { ClauseAuditItem } from '../types';

interface LegalGlossaryProps {
  documentText?: string;
  clauses?: ClauseAuditItem[];
  defaultOpen?: boolean;
}

export const LegalGlossary: React.FC<LegalGlossaryProps> = ({
  documentText = '',
  clauses = [],
  defaultOpen = true,
}) => {
  const [isSectionOpen, setIsSectionOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory>('All');
  const [expandedTermIds, setExpandedTermIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scan current document text and audited clauses for matching glossary terms
  const detectedTermIds = useMemo(() => {
    return identifyDocumentGlossaryTerms(documentText, clauses);
  }, [documentText, clauses]);

  // Expand all detected terms by default upon initial load if available
  React.useEffect(() => {
    if (detectedTermIds.size > 0 && expandedTermIds.size === 0) {
      // Expand detected terms by default so the user immediately sees context
      setExpandedTermIds(new Set(detectedTermIds));
    }
  }, [detectedTermIds]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return LEGAL_GLOSSARY.filter((item) => {
      // Category filter
      if (selectedCategory === 'In This Document') {
        if (!detectedTermIds.has(item.id)) return false;
      } else if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTerm = item.term.toLowerCase().includes(q);
        const matchesPlain = item.plainEnglish.toLowerCase().includes(q);
        const matchesFormal = item.formalLegalese.toLowerCase().includes(q);
        const matchesWhy = item.whyItMatters.toLowerCase().includes(q);
        const matchesTip = item.negotiationTip.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        return matchesTerm || matchesPlain || matchesFormal || matchesWhy || matchesTip || matchesCategory;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize terms detected in the active document first
      const aInDoc = detectedTermIds.has(a.id);
      const bInDoc = detectedTermIds.has(b.id);
      if (aInDoc && !bInDoc) return -1;
      if (!aInDoc && bInDoc) return 1;
      return 0;
    });
  }, [selectedCategory, searchQuery, detectedTermIds]);

  const toggleTerm = (id: string) => {
    setExpandedTermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedTermIds(new Set(filteredTerms.map((t) => t.id)));
  };

  const handleCollapseAll = () => {
    setExpandedTermIds(new Set());
  };

  const handleCopyExplanation = (term: GlossaryTerm) => {
    const textToCopy = `Legal Term: ${term.term}\nPlain-English Meaning: ${term.plainEnglish}\nWhy It Matters: ${term.whyItMatters}\nPro Negotiation Tip: ${term.negotiationTip}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskIcon = (tier: 'SAFE' | 'CAUTION' | 'HIDDEN_TRAP') => {
    switch (tier) {
      case 'HIDDEN_TRAP':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      case 'CAUTION':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'SAFE':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
  };

  const getRiskBadge = (tier: 'SAFE' | 'CAUTION' | 'HIDDEN_TRAP') => {
    switch (tier) {
      case 'HIDDEN_TRAP':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CAUTION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SAFE':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div
      id="legal-glossary-section"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
    >
      {/* Section Header with Expand/Collapse Trigger */}
      <div
        id="legal-glossary-header"
        onClick={() => setIsSectionOpen((prev) => !prev)}
        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Educational Resource
              </span>
              {detectedTermIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  {detectedTermIds.size} found in this document
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Legal Glossary & Plain-English Dictionary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Translating common contractual jargon, boilerplates, and legal fine print into plain language.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            {isSectionOpen ? 'Collapse' : 'Expand Glossary'}
          </span>
          <button
            id="legal-glossary-toggle-btn"
            type="button"
            aria-label={isSectionOpen ? 'Collapse legal glossary' : 'Expand legal glossary'}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content Area */}
      {isSectionOpen && (
        <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
          {/* Controls: Search + Actions */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="glossary-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal terms (e.g. indemnity, renewal, arbitration)..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions: Expand/Collapse All */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                id="glossary-expand-all-btn"
                type="button"
                onClick={handleExpandAll}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                id="glossary-collapse-all-btn"
                type="button"
                onClick={handleCollapseAll}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {GLOSSARY_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const isFoundInDocFilter = cat === 'In This Document';

              // Hide 'In This Document' filter if no terms detected in document
              if (isFoundInDocFilter && detectedTermIds.size === 0) {
                return null;
              }

              return (
                <button
                  key={cat}
                  id={`glossary-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? isFoundInDocFilter
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-900 text-white shadow-2xs'
                      : isFoundInDocFilter
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {isFoundInDocFilter && <Sparkles className="w-3 h-3" />}
                  <span>{cat}</span>
                  {isFoundInDocFilter && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-3xs font-bold bg-white/20">
                      {detectedTermIds.size}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Terms Count Banner */}
          <div className="text-xs text-slate-500 flex items-center justify-between pb-1 border-b border-slate-100">
            <span>
              Showing <strong className="text-slate-800">{filteredTerms.length}</strong> of{' '}
              {LEGAL_GLOSSARY.length} legal terms
              {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            </span>
            {detectedTermIds.size > 0 && (
              <span className="text-indigo-600 font-medium text-2xs">
                ★ Highlighted terms appear in your analyzed agreement
              </span>
            )}
          </div>

          {/* List of Expandable Glossary Cards */}
          {filteredTerms.length > 0 ? (
            <div className="space-y-3">
              {filteredTerms.map((term) => {
                const isExpanded = expandedTermIds.has(term.id);
                const isDetectedInDocument = detectedTermIds.has(term.id);

                return (
                  <div
                    key={term.id}
                    id={`glossary-term-${term.id}`}
                    className={`rounded-xl border transition-all ${
                      isDetectedInDocument
                        ? isExpanded
                          ? 'border-indigo-300 bg-indigo-50/20 shadow-xs'
                          : 'border-indigo-200 bg-indigo-50/10 hover:border-indigo-300'
                        : isExpanded
                        ? 'border-slate-300 bg-slate-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Term Header (Accordion Toggle) */}
                    <div
                      onClick={() => toggleTerm(term.id)}
                      className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                            {term.term}
                          </h4>

                          {/* Detected in this doc badge */}
                          {isDetectedInDocument && (
                            <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                              Found In Your Contract
                            </span>
                          )}

                          {/* Risk Tier Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-3xs font-semibold border flex items-center gap-1 ${getRiskBadge(
                              term.riskTier
                            )}`}
                          >
                            {getRiskIcon(term.riskTier)}
                            <span>{term.riskTier.replace('_', ' ')}</span>
                          </span>

                          {/* Category Badge */}
                          <span className="px-2 py-0.5 rounded-md text-3xs font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                            {term.category}
                          </span>
                        </div>

                        {/* Collapsed Snippet / Plain preview */}
                        {!isExpanded && (
                          <p className="text-xs text-slate-600 line-clamp-1 mt-1 leading-relaxed">
                            <strong className="font-semibold text-slate-700">In plain English:</strong>{' '}
                            {term.plainEnglish}
                          </p>
                        )}
                      </div>

                      {/* Expand indicator icon */}
                      <button
                        type="button"
                        id={`glossary-toggle-${term.id}`}
                        aria-label={isExpanded ? `Collapse ${term.term}` : `Expand ${term.term}`}
                        className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100/90 space-y-3.5 text-xs animate-in fade-in duration-150">
                        {/* 1. Formal Definition vs Plain English */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Formal Legalese Definition
                            </span>
                            <p className="text-slate-700 leading-relaxed italic text-xs">
                              "{term.formalLegalese}"
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                            <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800 font-semibold block mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              What it Actually Means in Plain English
                            </span>
                            <p className="text-emerald-950 font-medium leading-relaxed text-xs">
                              {term.plainEnglish}
                            </p>
                          </div>
                        </div>

                        {/* 2. Why It Matters / The Catch */}
                        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70">
                          <span className="text-3xs font-bold uppercase tracking-wider text-amber-900 block mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Why It Matters & Where The Catch Is
                          </span>
                          <p className="text-amber-950 leading-relaxed text-xs">
                            {term.whyItMatters}
                          </p>
                        </div>

                        {/* 3. Real-World Sample Snippet */}
                        <div>
                          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            Typical Contract Phrasing
                          </span>
                          <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-2xs leading-relaxed overflow-x-auto border border-slate-800">
                            {term.typicalClauseSnippet}
                          </div>
                        </div>

                        {/* 4. Actionable Negotiation Tip + Copy */}
                        <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-3xs font-bold uppercase tracking-wider text-indigo-900 block">
                                Pro Negotiation Tip
                              </span>
                              <p className="text-indigo-950 text-xs mt-0.5 leading-relaxed font-medium">
                                {term.negotiationTip}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            id={`copy-glossary-${term.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyExplanation(term);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-center shadow-2xs"
                          >
                            {copiedId === term.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Copy Summary</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm space-y-2">
              <p>No legal glossary terms match your current search or category filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
