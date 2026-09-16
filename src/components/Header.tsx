import React from 'react';
import { ShieldAlert, Scale, Info, Sparkles } from 'lucide-react';

interface HeaderProps {
  targetAudience: string;
  onAudienceChange: (audience: string) => void;
  onLoadSample: (sampleId: string) => void;
  samples: Array<{ id: string; title: string; type: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  targetAudience,
  onAudienceChange,
  onLoadSample,
  samples,
}) => {
  const audiences = [
    { id: 'Consumer', label: 'Everyday Consumer' },
    { id: 'Tenant', label: 'Renter / Tenant' },
    { id: 'Freelancer', label: 'Freelancer / Contractor' },
    { id: 'Student', label: 'Student' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  ClauseGuard
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Risk Auditor
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Plain-English legal auditor for consumers, students & freelancers
              </p>
            </div>
          </div>

          {/* Quick Audience Lens & Disclaimer Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              <span className="font-medium text-slate-700">Audit Perspective:</span>
              <select
                id="audience-selector"
                value={targetAudience}
                onChange={(e) => onAudienceChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                {audiences.map((aud) => (
                  <option key={aud.id} value={aud.id}>
                    {aud.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Prep tool • Not formal legal advice</span>
            </div>
          </div>
        </div>

        {/* Quick Sample Selector Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Quick Samples:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                id={`sample-btn-${sample.id}`}
                onClick={() => onLoadSample(sample.id)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200/80 font-medium"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
