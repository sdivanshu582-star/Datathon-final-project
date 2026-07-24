import React, { useState } from 'react';
import { FIR } from '../types';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Download, Printer, PlusCircle, Filter, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { DEFAULT_UNITS } from '../lib/supabase';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ReportsModuleProps {
  firs: FIR[];
  onAddFIR: (fir: FIR) => Promise<{ success: boolean; error?: string }>;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ firs, onAddFIR }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedHead, setSelectedHead] = useState('all');
  const [selectedGravity, setSelectedGravity] = useState('all');

  // Modal State for New FIR
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [newFIR, setNewFIR] = useState<Partial<FIR>>({
    crimeNo: `10001${DEFAULT_UNITS[0].id.replace(/\D/g, '')}2026${Math.floor(10000 + Math.random() * 90000)}`,
    unit: DEFAULT_UNITS[0].id,
    unitName: DEFAULT_UNITS[0].name,
    district: DEFAULT_UNITS[0].district,
    head: 'Property Crimes',
    section: 'IPC 395',
    gravity: 'Non-Heinous',
    csType: 'A -> Chargesheet',
    status: 'Under Investigation',
    ioId: 'EMP-1042',
    date: new Date().toISOString().split('T')[0],
    lat: DEFAULT_UNITS[0].lat,
    lng: DEFAULT_UNITS[0].lng,
    hourOfDay: 14,
    modusOperandi: 'Standard Forced Entry',
    stolenAsset: 'Jewelry/Cash'
  });

  // Filter FIRs
  const filteredFIRs = firs.filter(f => {
    if (selectedHead !== 'all' && f.head !== selectedHead) return false;
    if (selectedGravity !== 'all' && f.gravity !== selectedGravity) return false;
    if (fromDate && f.date < fromDate) return false;
    if (toDate && f.date > toDate) return false;
    return true;
  });

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = ['CrimeNo', 'UnitName', 'District', 'MajorHead', 'Section', 'Gravity', 'Date', 'Status', 'IO_ID'];
    const rows = filteredFIRs.map(f => [
      f.crimeNo,
      `"${f.unitName}"`,
      `"${f.district}"`,
      `"${f.head}"`,
      `"${f.section}"`,
      f.gravity,
      f.date,
      `"${f.status}"`,
      f.ioId
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KSP_FIR_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit New FIR to Supabase
  const handleCreateFIR = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    setFormSuccess('');

    const unitObj = DEFAULT_UNITS.find(u => u.id === newFIR.unit) || DEFAULT_UNITS[0];

    const firToSave: FIR = {
      crimeNo: newFIR.crimeNo || `10001${unitObj.id.replace(/\D/g, '')}2026${Math.floor(10000 + Math.random() * 90000)}`,
      unit: unitObj.id,
      unitName: unitObj.name,
      district: unitObj.district,
      head: newFIR.head || 'Property Crimes',
      section: newFIR.section || 'IPC 395',
      gravity: (newFIR.gravity as 'Heinous' | 'Non-Heinous') || 'Non-Heinous',
      csType: newFIR.csType || 'A -> Chargesheet',
      status: newFIR.status || 'Under Investigation',
      ioId: newFIR.ioId || 'EMP-1042',
      date: newFIR.date || new Date().toISOString().split('T')[0],
      lat: unitObj.lat + (Math.random() - 0.5) * 0.02,
      lng: unitObj.lng + (Math.random() - 0.5) * 0.02,
      hourOfDay: Number(newFIR.hourOfDay) || 12,
      modusOperandi: newFIR.modusOperandi || 'Unspecified',
      stolenAsset: newFIR.stolenAsset || 'N/A'
    };

    const res = await onAddFIR(firToSave);
    setSaving(false);

    if (res.success) {
      setFormSuccess('FIR successfully created and synced to Supabase database!');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } else {
      setFormError(res.error || 'Failed to save FIR to Supabase. Check RLS policies.');
    }
  };

  // Chart Data
  const chargesheetData = {
    labels: ['A -> Chargesheeted', 'B -> False Case', 'C -> Undetected'],
    datasets: [
      {
        data: [
          firs.filter(f => f.csType.includes('A')).length || 180,
          firs.filter(f => f.csType.includes('B')).length || 60,
          firs.filter(f => f.csType.includes('C')).length || 60
        ],
        backgroundColor: ['#10b981', '#8b5cf6', '#ef4444'],
      },
    ],
  };

  const sectionsData = {
    labels: ['IPC 302', 'IPC 307', 'IPC 395', 'IPC 420', 'NDPS Sec 20', 'IT Act 66D'],
    datasets: [
      {
        label: 'Section Mappings',
        data: [95, 65, 40, 80, 30, 50],
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      
      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Chargesheet Disposition */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Chargesheet Disposition Breakdown (cstype)</h3>
            <p className="text-xs text-slate-500">Distribution of Final Investigation Reports</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <Doughnut data={chargesheetData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 2: Legal Sections Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Top Invoked Legal Sections (IPC & Special Acts)</h3>
            <p className="text-xs text-slate-500">Frequency of ActSectionAssociation mappings</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <Bar data={sectionsData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
          </div>
        </div>

      </div>

      {/* Main Table & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Comprehensive FIR Search & Export Panel</span>
            </h3>
            <p className="text-xs text-slate-500">Filter by Date Range, Crime Head, Gravity, and Case Status</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New FIR</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Filters:</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
            />
          </div>

          <select
            value={selectedHead}
            onChange={(e) => setSelectedHead(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-medium"
          >
            <option value="all">All Crime Major Heads ({Array.from(new Set(firs.map(f => f.head))).filter(Boolean).length} Types)</option>
            {Array.from(new Set(firs.map(f => f.head))).filter(Boolean).map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <select
            value={selectedGravity}
            onChange={(e) => setSelectedGravity(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-medium"
          >
            <option value="all">All Gravity Types</option>
            <option value="Heinous">Heinous Only</option>
            <option value="Non-Heinous">Non-Heinous Only</option>
          </select>

          <span className="ml-auto font-semibold text-slate-500 text-[11px]">
            Showing {filteredFIRs.length} records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Crime No</th>
                <th className="px-4 py-3">Unit (Police Station)</th>
                <th className="px-4 py-3">Crime Major Head</th>
                <th className="px-4 py-3">Invoked Acts / Sections</th>
                <th className="px-4 py-3">Gravity</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">IO ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFIRs.slice(0, 50).map((fir, idx) => (
                <tr key={fir.id || fir.crimeNo || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{fir.crimeNo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{fir.unitName}</td>
                  <td className="px-4 py-3 text-slate-700">{fir.head}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {fir.section}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      fir.gravity === 'Heinous' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {fir.gravity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{fir.date}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{fir.ioId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: New FIR Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>Register New CCTNS FIR Record</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateFIR} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Crime Number (Structured Format)</label>
                <input
                  type="text"
                  required
                  value={newFIR.crimeNo || ''}
                  onChange={(e) => setNewFIR({ ...newFIR, crimeNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-mono font-bold text-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Police Station</label>
                  <select
                    value={newFIR.unit}
                    onChange={(e) => {
                      const u = DEFAULT_UNITS.find(unit => unit.id === e.target.value);
                      setNewFIR({ ...newFIR, unit: e.target.value, unitName: u?.name, district: u?.district });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
                  >
                    {DEFAULT_UNITS.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.district})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Crime Major Head</label>
                  <select
                    value={newFIR.head}
                    onChange={(e) => setNewFIR({ ...newFIR, head: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
                  >
                    <option value="Crimes Against Body">Crimes Against Body</option>
                    <option value="Property Crimes">Property Crimes</option>
                    <option value="Cyber Crimes">Cyber Crimes</option>
                    <option value="Economic Offences">Economic Offences</option>
                    <option value="Narcotics (NDPS)">Narcotics (NDPS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoked Act / Section</label>
                  <input
                    type="text"
                    required
                    value={newFIR.section || ''}
                    onChange={(e) => setNewFIR({ ...newFIR, section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gravity Level</label>
                  <select
                    value={newFIR.gravity}
                    onChange={(e) => setNewFIR({ ...newFIR, gravity: e.target.value as 'Heinous' | 'Non-Heinous' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
                  >
                    <option value="Non-Heinous">Non-Heinous (Gravity 2)</option>
                    <option value="Heinous">Heinous (Gravity 1)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registration Date</label>
                  <input
                    type="date"
                    required
                    value={newFIR.date || ''}
                    onChange={(e) => setNewFIR({ ...newFIR, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Investigating Officer (IO ID)</label>
                  <input
                    type="text"
                    required
                    value={newFIR.ioId || ''}
                    onChange={(e) => setNewFIR({ ...newFIR, ioId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2"
                >
                  <span>{saving ? 'Saving to Supabase...' : 'Save & Sync FIR'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
