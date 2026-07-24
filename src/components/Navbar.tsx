import React from 'react';
import { Database, ShieldCheck, UserCheck, LogOut, Shield } from 'lucide-react';
import { SupabaseConnectionStatus, SupabaseConfigInfo } from '../types';
import { OfficerUser } from './LoginModal';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  connectionStatus: SupabaseConnectionStatus | null;
  configInfo: SupabaseConfigInfo;
  currentUser: OfficerUser | null;
  onOpenSupabaseModal: () => void;
  onOpenLoginModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  connectionStatus,
  configInfo,
  currentUser,
  onOpenSupabaseModal,
  onOpenLoginModal,
  onOpenAdminModal,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Drishti-KSP</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-blue-100 text-blue-700 border border-blue-200">
                v2.6 Platform
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Karnataka State Police • Crime & Analytics Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActivePage('overview')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActivePage('map-view')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'map-view'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            🗺️ Geospatial Map
          </button>
          <button
            onClick={() => setActivePage('units')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'units'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            🚓 Police Units
          </button>
          <button
            onClick={() => setActivePage('reports')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            📄 CaseMaster Reports
          </button>
          <button
            onClick={() => setActivePage('insights')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'insights'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            🧠 AI & Graph Link
          </button>
        </nav>

        {/* Supabase Status Pill & Officer Login State */}
        <div className="flex items-center gap-2">
          {/* Owner Admin Registry Control Button */}
          <button
            onClick={onOpenAdminModal}
            title="Owner Admin: Manage Authorized Officer IDs"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Owner Admin</span>
          </button>

          {/* Supabase Connection Button */}
          <button
            onClick={onOpenSupabaseModal}
            title="Click to view Supabase Connection details"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              connectionStatus?.connected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold hidden md:inline">Supabase:</span>
            <span className="font-mono text-[11px] font-bold">
              {configInfo.projectId.slice(0, 8)}...
            </span>
            <span className={`w-2 h-2 rounded-full ${connectionStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          {/* Persistent Officer Profile or Login Trigger */}
          {currentUser?.authenticated ? (
            <div className="flex items-center gap-1.5 bg-blue-900 text-white px-2.5 py-1 rounded-lg border border-blue-800 text-xs shadow-xs">
              <Shield className="w-3.5 h-3.5 text-blue-300" />
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1 hover:underline text-left cursor-pointer"
                title="Click to view officer session profile"
              >
                <span className="font-mono font-bold text-blue-200">{currentUser.officerId}</span>
                <span className="text-slate-300 hidden xl:inline">({currentUser.district})</span>
              </button>
              <button
                onClick={onLogout}
                title="Logout Officer Session"
                className="ml-1 p-1 hover:bg-blue-800 text-slate-300 hover:text-white rounded transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>KSP Officer Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

