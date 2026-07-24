import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, ExternalLink, RefreshCw, Upload, Shield, Code, Server } from 'lucide-react';
import { SupabaseConfigInfo, SupabaseConnectionStatus, FIR } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  configInfo: SupabaseConfigInfo;
  connectionStatus: SupabaseConnectionStatus | null;
  onRecheckConnection: () => Promise<void>;
  onSeedSupabase: () => Promise<void>;
  dataSource: 'supabase' | 'local';
  totalFIRs: number;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  configInfo,
  connectionStatus,
  onRecheckConnection,
  onSeedSupabase,
  dataSource,
  totalFIRs
}) => {
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'schema' | 'sync'>('info');

  if (!isOpen) return null;

  const sqlSchema = `-- SQL Query to create the 'firs' table in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS firs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crimeNo TEXT UNIQUE NOT NULL,
  unit TEXT NOT NULL,
  unitName TEXT NOT NULL,
  district TEXT NOT NULL,
  head TEXT NOT NULL,
  section TEXT NOT NULL,
  gravity TEXT NOT NULL,
  csType TEXT NOT NULL,
  status TEXT NOT NULL,
  ioId TEXT NOT NULL,
  date DATE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  hourOfDay INT NOT NULL,
  modusOperandi TEXT,
  stolenAsset TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and set public policies if needed:
ALTER TABLE firs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read" ON firs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON firs FOR INSERT WITH CHECK (true);
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeedClick = async () => {
    setSeeding(true);
    await onSeedSupabase();
    setSeeding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Supabase Backend Integration</h2>
              <p className="text-xs text-slate-300">Connected Project: <span className="font-mono text-emerald-400">{configInfo.projectName}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-2 leading-none rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connection Details</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>SQL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Data Sync & Seed</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {activeTab === 'info' && (
            <div className="space-y-4">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                connectionStatus?.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {connectionStatus?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm">
                    {connectionStatus?.connected ? 'Supabase Connection Active' : 'Supabase Pending Setup'}
                  </div>
                  <p>{connectionStatus?.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white border font-mono font-semibold text-[11px]">
                      Active Mode: {dataSource === 'supabase' ? '🟢 Supabase Live DB' : '🟡 Local Cache'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border font-mono font-semibold text-[11px]">
                      Records: {totalFIRs} FIRs
                    </span>
                  </div>
                </div>
              </div>

              {/* Credentials Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Configured Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block">Project Name</label>
                    <input
                      readOnly
                      value={configInfo.projectName}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block">Project ID</label>
                    <input
                      readOnly
                      value={configInfo.projectId}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Supabase Endpoint URL</label>
                  <div className="flex gap-2 mt-0.5">
                    <input
                      readOnly
                      value={configInfo.projectUrl}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-800"
                    />
                    <a
                      href={configInfo.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-bold flex items-center gap-1 shrink-0 text-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Public Anon / API Key</label>
                  <div className="flex gap-2 mt-0.5">
                    <input
                      type="password"
                      readOnly
                      value={configInfo.apiKey}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-800"
                    />
                    <button
                      onClick={() => copyToClipboard(configInfo.apiKey)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded font-semibold shrink-0"
                    >
                      {copied ? 'Copied!' : 'Copy Key'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={onRecheckConnection}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Connection Now</span>
                </button>
              </div>

            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                To create or verify the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600 font-bold">firs</code> table in your Supabase project dashboard, open the <strong>SQL Editor</strong> in Supabase and run the snippet below:
              </p>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64 border border-slate-800">
                  {sqlSchema}
                </pre>
                <button
                  onClick={() => copyToClipboard(sqlSchema)}
                  className="absolute top-3 right-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <strong>💡 Tip:</strong> If row-level security (RLS) is enabled in Supabase, make sure your table policies allow <code>SELECT</code> and <code>INSERT</code> access for anonymous requests, or disable RLS for testing.
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Database Seeding & Batch Sync</span>
                </h3>
                <p className="text-slate-600">
                  You can push initial seed FIR records (120+ Karnataka Police incident records) directly into your Supabase database table (<code className="font-mono text-slate-800 font-bold">firs</code>).
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleSeedClick}
                    disabled={seeding}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                    <span>{seeding ? 'Seeding Data to Supabase...' : 'Seed 120+ Sample FIRs to Supabase Table'}</span>
                  </button>
                </div>
              </div>

              <div className="text-slate-500 text-[11px]">
                Note: Standard REST endpoint target: <code className="font-mono text-slate-700">{configInfo.projectUrl}/rest/v1/firs</code>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
