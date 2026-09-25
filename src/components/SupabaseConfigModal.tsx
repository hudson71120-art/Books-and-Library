import React, { useState } from 'react';
import { SupabaseConfig } from '../types';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_RBAC_SQL_SCHEMA,
} from '../lib/supabase';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  Shield,
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [activeTab, setActiveTab] = useState<'credentials' | 'schema' | 'env'>('credentials');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  // Show/Hide password toggles for keys
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(config);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({
      ...config,
      isConnected: testResult?.success ?? config.isConnected,
    });
    onConfigUpdated();
    onClose();
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_RBAC_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const envTemplateString = `# Books and Friends App - Supabase Project Credentials (Section 5)
PROJECT_ID=${config.projectId || 'vkmjrqvxtlmbnyvjqkta'}
SUPABASE_URL=${config.url || 'https://vkmjrqvxtlmbnyvjqkta.supabase.co'}
SUPABASE_PUBLISHABLE_KEY=${config.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
SUPABASE_SECRET_KEY=${config.secretKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
SUPABASE_JWKS_URL=${config.jwksUrl || `${config.url || 'https://vkmjrqvxtlmbnyvjqkta.supabase.co'}/auth/v1/.well-known/jwks.json`}
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envTemplateString);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleUrlChange = (newUrl: string) => {
    const updated: SupabaseConfig = { ...config, url: newUrl };
    // Auto-derive projectId and JWKS URL if formatted normally
    try {
      if (newUrl.includes('.supabase.co')) {
        const parts = newUrl.replace('https://', '').replace('http://', '').split('.');
        if (parts[0] && !config.projectId) {
          updated.projectId = parts[0];
        }
      }
      if (newUrl.startsWith('http')) {
        updated.jwksUrl = `${newUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
      }
    } catch {
      // Ignore URL parsing nuances
    }
    setConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-200/80 rounded-md text-stone-800">
              <Server className="w-5 h-5 text-stone-800" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                  Section 5
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Supabase Backend
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 leading-tight">
                Supabase Configuration & Admin SQL Schema
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded hover:bg-stone-200/60 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50/50 px-6 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Project Credentials</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Admin Role SQL Schema (RBAC)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('env')}
            className={`pb-2.5 px-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'env'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>.env Specification</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: Project Credentials */}
          {activeTab === 'credentials' && (
            <form id="supabase-config-form" onSubmit={handleSave} className="space-y-4">
              {/* Project ID */}
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. vkmjrqvxtlmbnyvjqkta"
                  value={config.projectId || ''}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Unique project identifier from your Supabase Dashboard URL.
                </span>
              </div>

              {/* SUPABASE_URL */}
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  SUPABASE_URL <span className="text-rose-600">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project-id.supabase.co"
                  value={config.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  The REST, Auth, and Storage host endpoint of your Supabase Cloud instance.
                </span>
              </div>

              {/* SUPABASE_PUBLISHABLE_KEY (Anon Key) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-800">
                    SUPABASE_PUBLISHABLE_KEY (Anon Key) <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showAnonKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAnonKey ? 'Mask' : 'Show key'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAnonKey ? 'text' : 'password'}
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.anonKey}
                    onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                    className="w-full px-3 py-2 pr-9 border border-stone-300 rounded font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <Key className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Public anon key used by browser clients under Row Level Security (RLS).
                </span>
              </div>

              {/* SUPABASE_SECRET_KEY (Service Role Key) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <label className="font-semibold text-stone-800">
                      SUPABASE_SECRET_KEY (Service Role Key)
                    </label>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-medium">
                      Admin Exclusive
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSecretKey ? 'Mask' : 'Show key'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role..."
                    value={config.secretKey || ''}
                    onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                    className="w-full px-3 py-2 pr-9 border border-stone-300 rounded font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <Shield className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5" />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Developer Admin secret key for executing privileged migrations and backend tasks.
                </span>
              </div>

              {/* SUPABASE_JWKS_URL */}
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  SUPABASE_JWKS_URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co/auth/v1/.well-known/jwks.json"
                  value={config.jwksUrl || ''}
                  onChange={(e) => setConfig({ ...config, jwksUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  JSON Web Key Set URL used for verifying signed JWT tokens.
                </span>
              </div>

              {/* Ping Endpoint Action */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Pinging Supabase...' : 'Test & Ping Supabase Endpoint'}</span>
                  </button>

                  {testResult && (
                    <div
                      className={`flex items-center gap-1 text-[11px] font-semibold ${
                        testResult.success ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>
                        {testResult.latencyMs}ms ({testResult.success ? 'Responsive' : 'Degraded'})
                      </span>
                    </div>
                  )}
                </div>

                {testResult && (
                  <p
                    className={`mt-2 p-2.5 rounded text-[11px] border leading-relaxed ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    {testResult.message}
                  </p>
                )}
              </div>

              {/* Local Fallback Guarantee Note */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-stone-600 text-[11px] space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-700" />
                  <span>Dual Layer Reliability: Supabase Cloud + Local Store</span>
                </div>
                <p className="leading-relaxed">
                  Books and Friends App synchronizes with your live Supabase database while ensuring continuous offline and local session operation so reading clubs and Open Library caching remain functional even during network transitions.
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: Admin Role SQL Database Schema (For Supabase) */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900">
                    Admin Role SQL Database Schema (For Supabase)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Execute this code in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to provision tables and Role-Based Access Control (RBAC).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded transition-colors cursor-pointer shadow-xs"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              {/* Schema Code Block */}
              <div className="relative bg-stone-900 rounded-lg p-4 font-mono text-[11px] text-stone-200 overflow-x-auto max-h-[380px] border border-stone-800 shadow-inner">
                <pre className="leading-relaxed select-all">{SUPABASE_RBAC_SQL_SCHEMA}</pre>
              </div>

              {/* RBAC Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="font-semibold text-stone-900 mb-1">
                    👑 Developer Admin Privileges
                  </div>
                  <p className="text-stone-600">
                    Authorized to <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, and <code>SELECT</code> across all tables via <code>public.is_admin()</code> with email <code>hudson002619@outlook.com</code>.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="font-semibold text-stone-900 mb-1">
                    👤 User Access Boundaries
                  </div>
                  <p className="text-stone-600">
                    Newly arriving users can only modify their own sessions (<code>auth.uid() = host_id</code>) and joined memberships. Modification of other users' interfaces is strictly prevented.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: .env Specification Reference */}
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900">
                    Environment Variables Template (.env)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Use these environment keys in your deployment or container configuration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded transition-colors cursor-pointer shadow-xs"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnv ? 'Copied Template' : 'Copy .env Format'}</span>
                </button>
              </div>

              <div className="bg-stone-900 rounded-lg p-4 font-mono text-[11px] text-stone-200 overflow-x-auto border border-stone-800">
                <pre className="leading-relaxed select-all">{envTemplateString}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            {config.isConnected ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Supabase Live Synchronization Active</span>
              </span>
            ) : (
              <span className="text-stone-500">Local fallback and SQL schema ready</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="supabase-config-form"
              onClick={(e) => {
                if (activeTab !== 'credentials') {
                  saveSupabaseConfig({
                    ...config,
                    isConnected: testResult?.success ?? config.isConnected,
                  });
                  onConfigUpdated();
                  onClose();
                }
              }}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs rounded font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
