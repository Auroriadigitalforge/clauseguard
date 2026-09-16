import React, { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, X, AlertCircle, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface DocumentUploaderProps {
  documentText: string;
  documentTitle: string;
  onTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onFileLoaded: (fileData: { base64?: string; mimeType?: string; name: string; text?: string }) => void;
  onAudit: () => void;
  isLoading: boolean;
  uploadedFileName: string | null;
  onClear: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documentText,
  documentTitle,
  onTextChange,
  onTitleChange,
  onFileLoaded,
  onAudit,
  isLoading,
  uploadedFileName,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;
  const charCount = documentText.length;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isText =
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.rtf');

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Data URL format: "data:application/pdf;base64,..."
        const base64Data = result.split(',')[1];
        onFileLoaded({
          base64: base64Data,
          mimeType: 'application/pdf',
          name: file.name,
          text: `[PDF File Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\nClauseGuard will directly audit the complete text, clauses, and structure of this PDF document.`,
        });
        if (!documentTitle) {
          onTitleChange(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = reader.result as string;
        onFileLoaded({
          name: file.name,
          text: textContent,
        });
        if (!documentTitle) {
          onTitleChange(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    } else {
      // General file attempt: read text
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = reader.result as string;
        onFileLoaded({
          name: file.name,
          text: textContent,
        });
        if (!documentTitle) {
          onTitleChange(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const canAudit = (documentText.trim().length > 30 || uploadedFileName) && !isLoading;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Tab Switcher & Title Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <FileText className="w-5 h-5 text-slate-700 shrink-0" />
          <input
            id="contract-title-input"
            type="text"
            aria-label="Contract or Document Title"
            placeholder="Contract / Document Name (e.g. Skyline Apt Lease 2026)"
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full bg-transparent font-semibold text-slate-900 placeholder:text-slate-500 text-sm sm:text-base focus:outline-none focus:ring-0"
          />
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg self-start sm:self-auto">
          <button
            id="tab-paste-text"
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste Text
          </button>
          <button
            id="tab-upload-file"
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'file'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      {/* File Upload Zone (when in File tab or dragging) */}
      {activeTab === 'file' ? (
        <div className="p-5">
          <div
            id="dropzone-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              aria-label="Upload contract file in PDF or text format"
              accept=".pdf,.txt,.md,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-slate-700" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              {uploadedFileName ? 'Change Document File' : 'Drop your contract here or click to browse'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports standard contracts in <span className="font-medium text-slate-700">PDF, TXT, or Markdown</span>. All auditing runs confidentially on our dedicated backend.
            </p>
          </div>

          {uploadedFileName && (
            <div className="mt-3 flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-900 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium truncate max-w-xs">{uploadedFileName}</span>
              </div>
              <button
                type="button"
                onClick={onClear}
                className="text-emerald-700 hover:text-emerald-900 font-semibold p-1 hover:bg-emerald-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Direct Textarea */}
      <div className={`p-4 sm:p-5 ${activeTab === 'file' && !documentText ? 'hidden' : 'block'}`}>
        <div className="relative">
          <textarea
            id="contract-textarea"
            aria-label="Paste contract clauses or agreement text"
            rows={activeTab === 'file' ? 6 : 10}
            placeholder="Paste contract clauses, residential lease terms, freelance scope of work, gym membership rules, or app terms of service here..."
            value={documentText}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full font-mono text-xs sm:text-sm text-slate-800 placeholder:text-slate-500 bg-slate-50/40 p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none leading-relaxed transition-all resize-y"
          />
          {documentText && (
            <button
              id="clear-text-btn"
              type="button"
              onClick={onClear}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Word count & action footer */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-slate-700">{wordCount}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-700">{charCount}</strong> characters
            </span>
            {uploadedFileName && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Source: {uploadedFileName}</span>
              </>
            )}
          </div>

          <button
            id="run-audit-button"
            type="button"
            disabled={!canAudit}
            onClick={onAudit}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              canAudit
                ? 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md cursor-pointer active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Auditing Legal Clauses...</span>
              </>
            ) : (
              <>
                <span>Audit with ClauseGuard</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
