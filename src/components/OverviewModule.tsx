import React, { useState } from 'react';
import { FIR } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Search, ShieldAlert, FileText, AlertTriangle, Layers } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OverviewModuleProps {
  firs: FIR[];
  dataSource: 'supabase' | 'local';
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ firs, dataSource }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalFIRs = firs.length;
  const heinousCount = firs.filter(f => f.gravity === 'Heinous').length;

  const filteredFIRs = firs.filter(f =>
    f.crimeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart 1: Monthly Trends Data
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'FIR Registration Frequency',
        data: [180, 220, 195, 240, 280, 230, totalFIRs > 0 ? totalFIRs : 275],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0284c7',
      },
    ],
  };

  // Chart 2: Crime Head Distribution
  const headCounts: Record<string, number> = {};
  firs.forEach(f => {
    headCounts[f.head] = (headCounts[f.head] || 0) + 1;
  });

  const pieData = {
    labels: Object.keys(headCounts).length ? Object.keys(headCounts) : ['Crimes Against Body', 'Property Crimes', 'Cyber Crimes', 'Economic Offences', 'Narcotics'],
    datasets: [
      {
        data: Object.values(headCounts).length ? Object.values(headCounts) : [35, 25, 20, 12, 8],
        backgroundColor: ['#ef4444', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Monitored Districts</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">31</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Active SCRB Jurisdictions</p>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Registered FIRs</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalFIRs.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            <span>Synced from {dataSource === 'supabase' ? 'Supabase DB' : 'Local Cache'}</span>
          </p>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Heinous Offences</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 tracking-tight">
            {heinousCount}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">GravityOffence ID = 1</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">AI Anomaly Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tracking-tight">24</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Hotspots & Recidivist Spikes</p>
        </div>

      </div>

      {/* 2 Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Crime Volume Trends (Monthly)</h3>
            <p className="text-xs text-slate-500">Historical case registration frequency state-wide</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 2: Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Major Crime Head Distribution</h3>
            <p className="text-xs text-slate-500">Percentage breakdown by CrimeGroup Name</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

      {/* Live CaseMaster Table Stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live CaseMaster Stream</h3>
            <p className="text-xs text-slate-500">Real-time FIR filings across Karnataka Police Stations</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search CrimeNo, Station, Head..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-y border-slate-200">
              <tr>
                <th className="px-4 py-3">Crime Number</th>
                <th className="px-4 py-3">Police Station</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Crime Major Head</th>
                <th className="px-4 py-3">Gravity</th>
                <th className="px-4 py-3">Registered Date</th>
                <th className="px-4 py-3">Investigation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFIRs.slice(0, 12).map((fir, idx) => (
                <tr key={fir.id || fir.crimeNo || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">
                    {fir.crimeNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {fir.unitName} <span className="text-slate-400 text-[10px]">({fir.unit})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {fir.district}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {fir.head}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      fir.gravity === 'Heinous'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {fir.gravity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {fir.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      fir.status.includes('Charge')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {fir.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
