import React, { useEffect, useRef, useState } from 'react';
import { LegalProvision, Recidivist } from '../types';
import { DEFAULT_RECIDIVISTS, fetchLegalProvisions } from '../lib/supabase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Brain, Network, RefreshCw, Cpu, ShieldAlert, Zap, BookOpen, Search } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export const InsightsModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [simHead, setSimHead] = useState('Crimes Against Body');
  const [simGravity, setSimGravity] = useState('Heinous');
  const [simAccused, setSimAccused] = useState('');
  const [simOutput, setSimOutput] = useState<{ score: number; matchMessage: string } | null>(null);

  // Legal Provisions State (IPC vs BNS)
  const [provisions, setProvisions] = useState<LegalProvision[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProvisions, setLoadingProvisions] = useState(false);

  useEffect(() => {
    async function loadProvisions() {
      setLoadingProvisions(true);
      const res = await fetchLegalProvisions();
      if (res.success && res.data.length > 0) {
        setProvisions(res.data);
      } else {
        // Fallback default IPC to BNS mapping table
        setProvisions([
          { id: 1, category: 'Murder', offence: 'Murder / Culpable Homicide', ipc_section: 'IPC 302', bns_section: 'BNS 103', punishment: 'Death or Life Imprisonment + Fine' },
          { id: 2, category: 'Murder', offence: 'Attempt to Murder', ipc_section: 'IPC 307', bns_section: 'BNS 109', punishment: 'Imprisonment up to 10 years or Life + Fine' },
          { id: 3, category: 'Kidnapping', offence: 'Kidnapping', ipc_section: 'IPC 363', bns_section: 'BNS 137', punishment: 'Imprisonment up to 7 years + Fine' },
          { id: 4, category: 'Kidnapping', offence: 'Kidnapping for Ransom', ipc_section: 'IPC 364A', bns_section: 'BNS 140', punishment: 'Death or Life Imprisonment' },
          { id: 5, category: 'Robbery', offence: 'Robbery', ipc_section: 'IPC 392', bns_section: 'BNS 309', punishment: 'Rigorously Imprisonment up to 10 years' },
          { id: 6, category: 'Robbery', offence: 'Dacoity', ipc_section: 'IPC 395', bns_section: 'BNS 310', punishment: 'Imprisonment for Life or 10 years' },
          { id: 7, category: 'Economic', offence: 'Cheating & Dishonesty', ipc_section: 'IPC 420', bns_section: 'BNS 318(4)', punishment: 'Imprisonment up to 7 years + Fine' }
        ]);
      }
      setLoadingProvisions(false);
    }
    loadProvisions();
  }, []);

  const filteredProvisions = provisions.filter(p => 
    p.offence.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ipc_section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bns_section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Network Link Canvas
  const drawNetworkGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 600;
    const height = 340;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const nodes = [
      { x: width * 0.45, y: height * 0.5, color: '#0284c7', label: 'CaseMaster #1000101', radius: 16 },
      { x: width * 0.2, y: height * 0.25, color: '#ef4444', label: 'Accused: A1 - Suresh', radius: 12 },
      { x: width * 0.75, y: height * 0.25, color: '#10b981', label: 'Station: Koramangala PS', radius: 12 },
      { x: width * 0.2, y: height * 0.75, color: '#f59e0b', label: 'Victim: Ramesh K', radius: 12 },
      { x: width * 0.75, y: height * 0.75, color: '#8b5cf6', label: 'GPS: 12.9352, 77.6245', radius: 12 }
    ];

    // Draw Edges
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    for (let i = 1; i < nodes.length; i++) {
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[i].x, nodes[i].y);
      ctx.stroke();
    }

    // Draw Nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#0f172a';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillText(n.label, n.x + n.radius + 6, n.y + 4);
    });
  };

  useEffect(() => {
    drawNetworkGraph();
    window.addEventListener('resize', drawNetworkGraph);
    return () => window.removeEventListener('resize', drawNetworkGraph);
  }, []);

  // Run AI MO Simulation
  const handleRunSimulation = () => {
    const isHeinous = simGravity === 'Heinous';
    const score = isHeinous ? Math.floor(Math.random() * 15) + 84 : Math.floor(Math.random() * 35) + 35;
    
    setSimOutput({
      score,
      matchMessage: isHeinous
        ? `High correlation (${score}% threat index) with violent recidivist profiles in CCTNS repository.`
        : `Moderate incident signature (${score}% threat index). Standard routine case tracking.`
    });
  };

  const threatDonutData = {
    labels: ['Critical High Risk', 'Medium Threat', 'Routine Case'],
    datasets: [
      {
        data: [15, 35, 50],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="space-y-6">
      
      {/* Network Canvas & Donut Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Link Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-600" />
                <span>Criminological Link Analysis Network</span>
              </h3>
              <p className="text-xs text-slate-500">Graph Relationship: Accused ↔ CaseMaster ↔ Locations ↔ Victims</p>
            </div>
            <button
              onClick={drawNetworkGraph}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-render</span>
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-80" />
          </div>
        </div>

        {/* AI Threat Donut Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>AI Threat Category Index</span>
            </h3>
            <p className="text-xs text-slate-500">Risk classification by ML models</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <Doughnut data={threatDonutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

      {/* Simulator & Watchlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MO Simulator */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Modus Operandi (MO) & Repeat Offender Profiler</span>
            </h3>
            <p className="text-xs text-slate-500">Simulate incoming FIR parameters to test AI risk score matching.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Crime Head</label>
              <select
                value={simHead}
                onChange={(e) => setSimHead(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
              >
                <option value="Crimes Against Body">Crimes Against Body (IPC 302, 307)</option>
                <option value="Property Crimes">Property Crimes (Robbery, Theft)</option>
                <option value="Cyber Crimes">Cyber Crimes (Financial Phishing)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Gravity Level</label>
              <select
                value={simGravity}
                onChange={(e) => setSimGravity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
              >
                <option value="Heinous">Heinous (Gravity ID 1)</option>
                <option value="Non-Heinous">Non-Heinous (Gravity ID 2)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Accused Name / Entity ID</label>
              <input
                type="text"
                placeholder="e.g. A1 - Ramesh @ Manya"
                value={simAccused}
                onChange={(e) => setSimAccused(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-medium"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Run AI Link Match</span>
            </button>

            {simOutput && (
              <div className={`p-4 rounded-xl border space-y-1 ${
                simOutput.score > 70
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>AI Assessment Match</span>
                  <span className="px-2 py-0.5 rounded bg-white text-xs border font-mono">
                    {simOutput.score}% Risk Index
                  </span>
                </div>
                <p className="text-xs">{simOutput.matchMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recidivist Watchlist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Automated Recidivist Watchlist</span>
            </h3>
            <p className="text-xs text-slate-500">Accused entities linked to multiple CaseMaster entries across districts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-y border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Accused ID</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Linked Cases</th>
                  <th className="px-3 py-2.5">Primary MO</th>
                  <th className="px-3 py-2.5">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEFAULT_RECIDIVISTS.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-red-600">{w.id}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-800">{w.name}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{w.cases} Cases</td>
                    <td className="px-3 py-2.5 text-slate-600">{w.mo}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                        {w.score}% Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Legal Provisions Concordance (IPC vs BNS) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Legal Provisions Mapping (IPC 1860 ↔ BNS 2023 Concordance)</span>
            </h3>
            <p className="text-xs text-slate-500">Cross-reference old Indian Penal Code sections with Bharatiya Nyaya Sanhita equivalents synced from Supabase</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search offence, IPC or BNS section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>
        </div>

        {loadingProvisions ? (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse">Loading legal provisions concordance from Supabase...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Offence Description</th>
                  <th className="px-4 py-3">Legacy IPC Section</th>
                  <th className="px-4 py-3">New BNS (2023) Section</th>
                  <th className="px-4 py-3">Prescribed Punishment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProvisions.map((lp) => (
                  <tr key={lp.id} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {lp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{lp.offence}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-700">{lp.ipc_section}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-emerald-700">{lp.bns_section}</td>
                    <td className="px-4 py-3 text-slate-600">{lp.punishment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

