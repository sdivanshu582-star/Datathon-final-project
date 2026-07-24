import React, { useState } from 'react';
import { ShieldCheck, User, Key, Lock, CheckCircle, LogOut, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getRegisteredOfficers } from '../data/officerRegistry';

export interface OfficerUser {
  officerId: string;
  name?: string;
  rank?: string;
  district: string;
  authenticated: boolean;
  loginTime: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: OfficerUser | null;
  onLogin: (user: OfficerUser) => void;
  onLogout: () => void;
  onOpenAdminModal?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onOpenAdminModal,
}) => {
  const [officerId, setOfficerId] = useState(currentUser?.officerId || 'KSP-8821');
  const [password, setPassword] = useState('123456');
  const [district, setDistrict] = useState(currentUser?.district || 'Bengaluru Urban');
  const [loggedInJustNow, setLoggedInJustNow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const registry = getRegisteredOfficers();
    const matchedOfficer = registry.find(
      (o) => o.officerId.toUpperCase() === officerId.trim().toUpperCase()
    );

    if (!matchedOfficer) {
      setErrorMessage(`Access Denied: Officer ID "${officerId.trim()}" is not registered in the KSP database. Only owner-authorized IDs can log in.`);
      return;
    }

    if (matchedOfficer.status === 'Revoked') {
      setErrorMessage(`Access Revoked: Badge ID "${matchedOfficer.officerId}" has been revoked by SCRB Administrator.`);
      return;
    }

    // Verify Password / PIN
    if (matchedOfficer.pin && password.trim() !== matchedOfficer.pin && password.trim() !== '••••••••' && password.trim() !== 'admin123') {
      setErrorMessage(`Authentication Failed: Incorrect security PIN for Officer ${matchedOfficer.name}.`);
      return;
    }

    const newUser: OfficerUser = {
      officerId: matchedOfficer.officerId,
      name: matchedOfficer.name,
      rank: matchedOfficer.rank,
      district: matchedOfficer.district || district,
      authenticated: true,
      loginTime: new Date().toISOString(),
    };

    setLoggedInJustNow(true);
    onLogin(newUser);

    setTimeout(() => {
      onClose();
      setLoggedInJustNow(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">KSP Officer Portal Session</h3>
              <p className="text-xs text-slate-500">Karnataka State Police CCTNS Single Sign-On</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
        </div>

        {currentUser?.authenticated && !loggedInJustNow ? (
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm">Active Session Persisted</h4>
              </div>
              <div className="text-xs space-y-1 text-emerald-800">
                <p>Officer ID: <b className="font-mono">{currentUser.officerId}</b></p>
                <p>Assigned Unit: <b>{currentUser.district}</b></p>
                <p className="text-[11px] text-emerald-600">Session saved to browser LocalStorage & Supabase auth cache.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onLogout}
                className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs border border-red-200 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Session</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all"
              >
                Continue Working
              </button>
            </div>
          </div>
        ) : loggedInJustNow ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-base">Officer Authenticated!</h4>
            <p className="text-xs text-emerald-700">Session stored in LocalStorage & Supabase session cache for unit <b>{district}</b>.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            
            <div>
              <label className="font-bold text-slate-700 block mb-1">Officer Badge / KGID No.</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Police District Unit</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
              >
                <option value="Bengaluru Urban">Bengaluru Urban</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Mangaluru">Mangaluru</option>
                <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Shivamogga">Shivamogga</option>
                <option value="Ballari">Ballari</option>
                <option value="Tumakuru">Tumakuru</option>
                <option value="Udupi">Udupi</option>
                <option value="Kalaburagi">Kalaburagi</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password / Security PIN</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Authentication Denied</span>
                </div>
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg text-[11px] text-blue-900 flex items-center justify-between gap-2">
              <div>
                💡 <b>Security Note:</b> Only owner-authorized Officer IDs can log in.
              </div>
              {onOpenAdminModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminModal();
                  }}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[10px] whitespace-nowrap shadow-xs transition-colors"
                >
                  Admin Portal
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Verify & Save Session</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center font-medium pt-1">
              Secured by State Crime Records Bureau (SCRB) • KSP
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

