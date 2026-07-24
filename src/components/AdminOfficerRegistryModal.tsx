import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldAlert, Trash2, CheckCircle2, AlertTriangle, Key, Search, UserCheck, Shield } from 'lucide-react';
import { RegisteredOfficer, getRegisteredOfficers, registerNewOfficer, deleteOfficer, toggleOfficerStatus } from '../data/officerRegistry';

interface AdminOfficerRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfficerRegistryUpdated?: () => void;
}

export const AdminOfficerRegistryModal: React.FC<AdminOfficerRegistryModalProps> = ({
  isOpen,
  onClose,
  onOfficerRegistryUpdated,
}) => {
  const [officers, setOfficers] = useState<RegisteredOfficer[]>([]);
  const [search, setSearch] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinError, setAdminPinError] = useState('');

  // Form State for Adding New Officer
  const [newOfficerId, setNewOfficerId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('Police Inspector (PI)');
  const [newDistrict, setNewDistrict] = useState('Bengaluru Urban');
  const [newPin, setNewPin] = useState('123456');
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  const refreshList = () => {
    setOfficers(getRegisteredOfficers());
    if (onOfficerRegistryUpdated) onOfficerRegistryUpdated();
  };

  if (!isOpen) return null;

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'admin123' || adminPin === '123456' || adminPin === 'admin') {
      setIsAdminUnlocked(true);
      setAdminPinError('');
    } else {
      setAdminPinError('Invalid Admin Password. Access restricted to Website Owner / SCRB Administrator.');
    }
  };

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerId || !newName || !newPin) {
      setFormMsg({ type: 'error', text: 'All fields including Officer ID, Name and Security PIN are required.' });
      return;
    }

    const res = registerNewOfficer({
      officerId: newOfficerId.trim().toUpperCase(),
      name: newName.trim(),
      rank: newRank,
      district: newDistrict,
      pin: newPin.trim(),
      status: 'Active',
      addedBy: 'Website Owner Admin',
      createdAt: new Date().toISOString(),
    });

    if (res.success) {
      setFormMsg({ type: 'success', text: res.message });
      setNewOfficerId('');
      setNewName('');
      setNewPin('123456');
      refreshList();
    } else {
      setFormMsg({ type: 'error', text: res.message });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove Officer ID ${id} (${name}) from the registered database?`)) {
      deleteOfficer(id);
      refreshList();
    }
  };

  const handleToggle = (id: string) => {
    toggleOfficerStatus(id);
    refreshList();
  };

  const filteredOfficers = officers.filter(
    (o) =>
      o.officerId.toLowerCase().includes(search.toLowerCase()) ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.district.toLowerCase().includes(search.toLowerCase()) ||
      o.rank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Website Owner Admin • Officer ID Registry</h3>
              <p className="text-xs text-slate-500">Authorize Officer IDs & Security PINs to prevent false user logins</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
        </div>

        {!isAdminUnlocked ? (
          /* Admin Security Verification */
          <form onSubmit={handleUnlockAdmin} className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Website Owner Administrative Control</span>
              </div>
              <p>Enter the Owner Admin Security PIN (Default: <code>admin123</code> or <code>123456</code>) to manage registered officer IDs and credentials.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">Admin Master Key / Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter admin master password..."
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
              {pinError && <p className="text-xs text-red-600 font-semibold mt-1.5">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Unlock Officer Registry Management</span>
            </button>
          </form>
        ) : (
          /* Unlocked Admin Panel */
          <div className="space-y-6">
            
            {/* Add New Officer Form */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Register New Authorized Officer ID</span>
              </h4>

              {formMsg && (
                <div className={`p-2.5 rounded-lg text-xs font-medium ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {formMsg.text}
                </div>
              )}

              <form onSubmit={handleAddOfficer} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Officer Badge / KGID ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KSP-9942 or KGID-1082"
                    value={newOfficerId}
                    onChange={(e) => setNewOfficerId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Officer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspector Vijay V."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation Rank</label>
                  <select
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  >
                    <option value="Police Inspector (PI)">Police Inspector (PI)</option>
                    <option value="Sub-Inspector (PSI)">Sub-Inspector (PSI)</option>
                    <option value="Deputy Superintendent of Police (DySP)">Deputy Superintendent (DySP)</option>
                    <option value="Superintendent of Police (SP)">Superintendent of Police (SP)</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Police District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden"
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
                  <label className="font-bold text-slate-700 block mb-1">Officer Login Password / Security PIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Authorize Officer ID</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Registered Officer IDs */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-xs">Registered Officer Directory ({officers.length} IDs)</h4>
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search officer badge, name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-1 text-xs outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Badge ID</th>
                      <th className="px-3 py-2.5">Officer Name</th>
                      <th className="px-3 py-2.5">District</th>
                      <th className="px-3 py-2.5">Password PIN</th>
                      <th className="px-3 py-2.5">Badge Status</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOfficers.map((officer) => (
                      <tr key={officer.officerId} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-3 py-2.5 font-mono font-bold text-blue-900">{officer.officerId}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-800">{officer.name}</div>
                          <div className="text-[10px] text-slate-500">{officer.rank}</div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700">{officer.district}</td>
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-600">
                          {officer.pin ? '••••' + officer.pin.slice(-2) : '••••••'}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => handleToggle(officer.officerId)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                              officer.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                            title="Click to toggle Active/Revoked"
                          >
                            {officer.status}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleDelete(officer.officerId, officer.name)}
                            disabled={officer.officerId === 'ADMIN-001'}
                            className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                            title="Delete Officer Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
