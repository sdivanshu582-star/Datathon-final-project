import React from 'react';
import { ShieldAlert, Lock, Key, UserCheck, Shield, FileText, Map, AlertTriangle, EyeOff } from 'lucide-react';

interface AuthenticationGateProps {
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
}

export const AuthenticationGate: React.FC<AuthenticationGateProps> = ({
  onOpenLogin,
  onOpenAdmin,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8 animate-in fade-in zoom-in-95">
      
      {/* Main Lock Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-8 text-white shadow-2xl border border-blue-800/50 text-center relative overflow-hidden">
        {/* Background Shield Graphic */}
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
          <Shield className="w-80 h-80 text-blue-400" />
        </div>

        <div className="max-w-2xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>KSP CCTNS Restricted Access Shield</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Authentication Required to Access Crime Records & Analytics
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            All FIR records, geospatial crime hotspot maps, suspect link graphs, and police unit analytics are strictly classified under the Karnataka Police Act & CCTNS guidelines. Important data is hidden until an authorized officer logs in.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Log In with Officer Badge ID</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs text-amber-900 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-950" />
              <span>Website Owner Admin • Manage Officer IDs</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            🔒 Only owner-authorized Officer IDs (e.g. <code>KSP-8821</code>, <code>KSP-1042</code>, <code>ADMIN-001</code>) can unlock data.
          </p>
        </div>
      </div>

      {/* Redacted Data Sample Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Hidden FIR Dataset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>FIR Records & Legal Provisions</span>
            </div>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2 py-2 filter blur-xs select-none opacity-50">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          </div>

          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-600 font-bold">
            🔒 3,300+ FIR Records Protected
          </div>
        </div>

        {/* Card 2: Hidden Geospatial Map */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-800">
              <Map className="w-4 h-4 text-emerald-600" />
              <span>GIS Hotspot & Night Shift Patrol</span>
            </div>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2 py-2 filter blur-xs select-none opacity-50">
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-100 rounded w-4/5"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>

          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-600 font-bold">
            🔒 High-Precision GIS Map Hidden
          </div>
        </div>

        {/* Card 3: Hidden Police Unit Intelligence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Station Risk Scores & Roster</span>
            </div>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2 py-2 filter blur-xs select-none opacity-50">
            <div className="h-4 bg-slate-200 rounded w-3/5"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            <div className="h-3 bg-slate-100 rounded w-3/4"></div>
          </div>

          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-600 font-bold">
            🔒 Police Station Analytics Locked
          </div>
        </div>

      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm">Security Policy Notice for Website Visitors</h4>
          <p className="text-blue-800">
            To prevent false logins and unauthorized data access, the website owner manages all approved Officer IDs in the system registry. Visitors can click the <b>Owner Admin</b> button on top to register or view authorized IDs (Default Admin Key: <code>admin123</code>).
          </p>
        </div>
      </div>

    </div>
  );
};
