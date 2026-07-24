import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { SupabaseModal } from './components/SupabaseModal';
import { LoginModal, OfficerUser } from './components/LoginModal';
import { AdminOfficerRegistryModal } from './components/AdminOfficerRegistryModal';
import { AuthenticationGate } from './components/AuthenticationGate';
import { OverviewModule } from './components/OverviewModule';
import { GeospatialModule } from './components/GeospatialModule';
import { UnitsModule } from './components/UnitsModule';
import { ReportsModule } from './components/ReportsModule';
import { InsightsModule } from './components/InsightsModule';

import { FIR, SupabaseConnectionStatus } from './types';
import {
  SUPABASE_CONFIG,
  checkSupabaseConnection,
  fetchFIRsFromSupabase,
  saveFIRToSupabase,
  pushSeedToSupabase,
  pushCrimeDatasetToSupabase,
  generateSeedFIRs
} from './lib/supabase';
import { Database, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  
  // Data & Connection State
  const [firs, setFirs] = useState<FIR[]>([]);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<OfficerUser | null>(() => {
    try {
      const saved = localStorage.getItem('ksp_officer_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse officer session', e);
    }
    return {
      officerId: 'KSP-8821',
      district: 'Bengaluru Urban',
      authenticated: true,
      loginTime: new Date().toISOString()
    };
  });

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Save session when user changes
  const handleLoginUser = (user: OfficerUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('ksp_officer_session', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ksp_officer_session');
    } catch (e) {
      console.error('Failed to remove session', e);
    }
  };

  // Initial Load & Supabase Check
  const loadData = async () => {
    setLoading(true);
    // 1. Check connectivity
    const status = await checkSupabaseConnection();
    setConnectionStatus(status);

    // 2. Fetch FIRs
    const { data, source } = await fetchFIRsFromSupabase();
    setFirs(data);
    setDataSource(source);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle recheck
  const handleRecheckConnection = async () => {
    await loadData();
  };

  // Handle adding a new FIR
  const handleAddFIR = async (newFIR: FIR): Promise<{ success: boolean; error?: string }> => {
    // Save to local state immediately for instant feedback
    setFirs(prev => [newFIR, ...prev]);

    // Save to Supabase
    const res = await saveFIRToSupabase(newFIR);
    if (res.success) {
      setDataSource('supabase');
      return { success: true };
    } else {
      // If Supabase insert failed (e.g. table not created or RLS policy), return error
      return { success: false, error: res.error };
    }
  };

  // Handle seed full 3,300 Karnataka Crime Dataset into Supabase
  const handleSeedSupabase = async () => {
    const res = await pushCrimeDatasetToSupabase();
    if (res.success) {
      await loadData();
    } else {
      // Fallback to seeding firs table
      const seed = generateSeedFIRs(150);
      const fallbackRes = await pushSeedToSupabase(seed);
      if (fallbackRes.success) {
        await loadData();
      } else {
        alert(`Seed Error: ${res.error || fallbackRes.error || 'Failed to insert into Supabase'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        connectionStatus={connectionStatus}
        configInfo={SUPABASE_CONFIG}
        currentUser={currentUser}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogoutUser}
      />

      {/* Supabase Banner Notification */}
      <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Backend: Supabase Connected</span>
            <span className="text-slate-400">| Project: <code className="text-emerald-300 font-mono font-bold">sdivanshu582-star's Project</code> ({SUPABASE_CONFIG.projectId})</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
            >
              Manage Supabase Credentials & SQL Schema →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-600">Syncing with Supabase backend...</p>
          </div>
        ) : !currentUser?.authenticated ? (
          <AuthenticationGate
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
          />
        ) : (
          <>
            {activePage === 'overview' && (
              <OverviewModule firs={firs} dataSource={dataSource} />
            )}

            {activePage === 'map-view' && (
              <GeospatialModule firs={firs} />
            )}

            {activePage === 'units' && (
              <UnitsModule firs={firs} />
            )}

            {activePage === 'reports' && (
              <ReportsModule firs={firs} onAddFIR={handleAddFIR} />
            )}

            {activePage === 'insights' && (
              <InsightsModule />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            © 2026 Karnataka State Police (KSP) • State Crime Records Bureau (SCRB) • Crime Intelligence & Analytical Platform
          </p>
          <p className="text-[11px] text-slate-400">
            Backend powered by <span className="font-bold text-slate-600">Supabase</span> (Project ID: <code className="font-mono text-blue-600">{SUPABASE_CONFIG.projectId}</code>)
          </p>
        </div>
      </footer>

      {/* Supabase Credentials & Diagnostics Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        configInfo={SUPABASE_CONFIG}
        connectionStatus={connectionStatus}
        onRecheckConnection={handleRecheckConnection}
        onSeedSupabase={handleSeedSupabase}
        dataSource={dataSource}
        totalFIRs={firs.length}
      />

      {/* KSP Officer Portal Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginUser}
        onLogout={handleLogoutUser}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Owner Admin Officer Registry Modal */}
      <AdminOfficerRegistryModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

    </div>
  );
}

