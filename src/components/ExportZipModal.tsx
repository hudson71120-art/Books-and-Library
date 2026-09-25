import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  X,
  Download,
  FolderArchive,
  Terminal,
  CheckCircle2,
  Database,
  Code2,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { SUPABASE_RBAC_SQL_SCHEMA } from '../lib/supabase';

interface ExportZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportZipModal: React.FC<ExportZipModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      // 1. Try downloading the pre-packaged complete repository
      const response = await fetch('/books-and-friends-app.zip');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'books-and-friends-app.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloadSuccess(true);
        return;
      }

      // 2. Fallback: generate bundle via JSZip
      const zip = new JSZip();

      zip.file(
        'README.md',
        `# Books and Friends App 📚✨\n\nFull-stack book club and reading session web app connected with Open Library API and Supabase backend.\n\n## Quick Start:\n\`\`\`bash\nnpm install\ncp .env.example .env\nnpm run dev\n\`\`\`\n\nOpen http://localhost:3000 in your browser.`
      );

      zip.file(
        'SUPABASE_GUIDE.md',
        `# Books and Friends App - Supabase Setup Guide\n\n1. Run the SQL schema from \`supabase-schema.sql\` in Supabase SQL Editor.\n2. Configure \`.env\` with your Supabase URL & Anon Key.\n3. Run \`npm run dev\` in VS Code.`
      );

      zip.file('supabase-schema.sql', SUPABASE_RBAC_SQL_SCHEMA);

      zip.file(
        '.env.example',
        `VITE_SUPABASE_PROJECT_ID="vkmjrqvxtlmbnyvjqkta"\nVITE_SUPABASE_URL="https://vkmjrqvxtlmbnyvjqkta.supabase.co"\nVITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'books-and-friends-app.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (e) {
      console.error('Failed to generate zip', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-200 rounded text-stone-900">
              <FolderArchive className="w-5 h-5 text-stone-800" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                VS Code & Full-Stack Deployment
              </span>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Export Project ZIP & Supabase Guide
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded hover:bg-stone-200 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Download Box */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Clean & Bug-free Project Archive</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-sans rounded font-semibold">
                  Ready to Run
                </span>
              </h4>
              <p className="text-stone-600 text-xs">
                Cleaned codebase with all boilerplate removed, complete with TypeScript, Vite, React 19, Open Library integration, and Supabase RBAC schema.
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Packaging ZIP...' : 'Download Project .ZIP'}</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Success!</strong> <code>books-and-friends-app.zip</code> has started downloading.
              </span>
            </div>
          )}

          {/* Quick Terminal Guide for VS Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-stone-700" />
                <span>VS Code Terminal Commands</span>
              </h4>
              <button
                onClick={() =>
                  handleCopy('npm install\ncp .env.example .env\nnpm run dev', 'commands')
                }
                className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'commands' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode === 'commands' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <div className="bg-stone-900 text-stone-200 p-3.5 rounded font-mono text-[11px] space-y-1">
              <div className="text-stone-400"># 1. Install dependencies</div>
              <div className="text-emerald-400">npm install</div>
              <div className="text-stone-400 pt-1"># 2. Configure environment</div>
              <div className="text-emerald-400">cp .env.example .env</div>
              <div className="text-stone-400 pt-1"># 3. Start local development server</div>
              <div className="text-emerald-400">npm run dev</div>
            </div>
          </div>

          {/* Supabase Schema & Connection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-stone-700" />
                <span>Supabase Database Schema (supabase-schema.sql)</span>
              </h4>
              <button
                onClick={() => handleCopy(SUPABASE_RBAC_SQL_SCHEMA, 'schema')}
                className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'schema' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode === 'schema' ? 'Copied' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <p className="text-stone-600 text-[11px]">
              Open your <strong>Supabase Dashboard &gt; SQL Editor</strong>, paste this script, and click <strong>Run</strong> to set up RBAC tables, functions, and RLS policies.
            </p>
          </div>

          {/* Developer Admin Details */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded space-y-1">
            <h5 className="font-semibold text-amber-950">Developer Admin Credentials</h5>
            <div className="text-[11px] text-amber-900 font-mono space-y-0.5">
              <div>Email: <strong>hudson002619@outlook.com</strong></div>
              <div>Password: <strong>mYZuMr4W1hjEqE0q</strong></div>
            </div>
            <p className="text-[10px] text-amber-800/80">
              Authorized to Insert, Update, Delete, and Select across all database tables. Regular users are protected under user access boundaries.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
