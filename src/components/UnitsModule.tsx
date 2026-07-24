import React from 'react';
import { FIR } from '../types';
import { DEFAULT_UNITS } from '../lib/supabase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Shield, Building2, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UnitsModuleProps {
  firs: FIR[];
}

export const UnitsModule: React.FC<UnitsModuleProps> = ({ firs }) => {
  // Aggregate crime data by district and police station
  const stationStatsMap: Record<string, { name: string; district: string; count: number; heinous: number }> = {};

  firs.forEach(fir => {
    const key = fir.unitName || fir.district;
    if (!stationStatsMap[key]) {
      stationStatsMap[key] = {
        name: fir.unitName || `${fir.district} PS`,
        district: fir.district,
        count: 0,
        heinous: 0
      };
    }
    stationStatsMap[key].count += 1;
    if (fir.gravity === 'Heinous') {
      stationStatsMap[key].heinous += 1;
    }
  });

  const unitsList = Object.values(stationStatsMap).sort((a, b) => b.count - a.count);

  const barData = {
    labels: unitsList.map(u => u.name),
    datasets: [
      {
        label: 'Total Incident Load',
        data: unitsList.map(u => u.count),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
      {
        label: 'Heinous Crimes',
        data: unitsList.map(u => u.heinous),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      }
    ],
  };

  return (
    <div className="space-y-6">
      
      {/* Unit Load Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>District vs. Police Unit Crime Load Analysis</span>
            </h3>
            <p className="text-xs text-slate-500">Comparative volume of reported incidents across top operational stations</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table: Unit Hierarchy Registry (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Unit Operations & Hierarchy Registry</h3>
            <p className="text-xs text-slate-500">CCTNS node identifiers and police station hierarchy level</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-y border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Unit ID</th>
                  <th className="px-3 py-2.5">Station Name</th>
                  <th className="px-3 py-2.5">District</th>
                  <th className="px-3 py-2.5">Hierarchy</th>
                  <th className="px-3 py-2.5">Incident Load</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unitsList.map((unit, index) => {
                  return (
                    <tr key={unit.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-700">KSP-{101 + index}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">{unit.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{unit.district}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-[11px]">Level 3 (Police Station)</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{unit.count} FIRs</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          Active Sync
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threat Matrix Heatmap Grid (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>Spatiotemporal Threat Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">Automated risk scores per station based on recent incident density.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {unitsList.map(unit => {
              const count = unit.count;
              const isHigh = count > 200 || unit.heinous > 50;

              return (
                <div
                  key={unit.name}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isHigh
                      ? 'bg-red-50/70 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="font-black text-xs text-slate-900">{unit.district}</div>
                  <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">{unit.name}</div>
                  <div className={`text-xs font-extrabold mt-2 ${isHigh ? 'text-red-600' : 'text-emerald-600'}`}>
                    {count} Cases ({unit.heinous} Heinous)
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                    {isHigh ? '⚠️ High Load' : '🟢 Active Sync'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
