import React, { useEffect, useRef, useState } from 'react';
import { FIR, PoliceUnit } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_UNITS } from '../lib/supabase';
import { MapPin, Sliders, Layers, Clock, ShieldAlert } from 'lucide-react';

interface GeospatialModuleProps {
  firs: FIR[];
}

export const GeospatialModule: React.FC<GeospatialModuleProps> = ({ firs }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const hotspotsGroupRef = useRef<L.LayerGroup | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [timeShift, setTimeShift] = useState<number>(0); // 0 = 24h, 1 = 6-12, 2 = 12-18, 3 = 18-0, 4 = 0-6

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Create map focused on Bangalore / Karnataka coordinates
      const map = L.map(mapContainerRef.current).setView([12.9716, 77.5946], 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      hotspotsGroupRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Extract dynamic categories & stations from FIR dataset
  const uniqueCategories = Array.from(new Set(firs.map(f => f.head))).filter(Boolean);
  const uniqueDistricts = Array.from(new Set(firs.map(f => f.district))).filter(Boolean);
  const uniqueStations = Array.from(new Set(firs.map(f => f.unitName))).filter(Boolean);

  // Filter FIRs
  const filteredFIRs = firs.filter(fir => {
    if (categoryFilter !== 'ALL' && fir.head !== categoryFilter) return false;
    if (stationFilter !== 'ALL' && fir.unitName !== stationFilter && fir.unit !== stationFilter) return false;
    
    if (timeShift === 1 && (fir.hourOfDay < 6 || fir.hourOfDay >= 12)) return false;
    if (timeShift === 2 && (fir.hourOfDay < 12 || fir.hourOfDay >= 18)) return false;
    if (timeShift === 3 && (fir.hourOfDay < 18 || fir.hourOfDay >= 24)) return false;
    if (timeShift === 4 && (fir.hourOfDay < 0 || fir.hourOfDay >= 6)) return false;

    return true;
  });

  // Update Map Markers and Hotspot Overlays
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current || !hotspotsGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    hotspotsGroupRef.current.clearLayers();

    const getCategoryColor = (cat: string) => {
      switch (cat) {
        case 'Crimes Against Body': return '#ef4444';
        case 'Property Crimes': return '#f59e0b';
        case 'Cyber Crimes': return '#38bdf8';
        case 'Economic Offences': return '#a855f7';
        case 'Narcotics (NDPS)': return '#10b981';
        default: return '#94a3b8';
      }
    };

    if (showMarkers) {
      filteredFIRs.forEach(fir => {
        const color = getCategoryColor(fir.head);
        
        // Custom circle icon
        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 8px ${color};"></div>`,
          iconSize: [14, 14],
        });

        const marker = L.marker([fir.lat, fir.lng], { icon });
        
        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #0f172a; min-width: 180px;">
            <div style="border-bottom: 2px solid ${color}; padding-bottom: 4px; margin-bottom: 6px; font-weight: bold; display: flex; justify-content: space-between;">
              <span>${fir.crimeNo}</span>
              <span>${fir.hourOfDay}:00 IST</span>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 13px; color: #1e293b;">${fir.head}</div>
              <div style="color: #475569; margin-top: 2px;">Station: <b>${fir.unitName}</b></div>
              <div style="color: #475569;">Gravity: <b>${fir.gravity}</b></div>
              <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Status: ${fir.status}</div>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markersGroupRef.current?.addLayer(marker);
      });
    }

    if (showHotspots) {
      DEFAULT_UNITS.forEach(unit => {
        if (stationFilter !== 'ALL' && unit.id !== stationFilter) return;
        const count = filteredFIRs.filter(f => f.unit === unit.id).length;
        if (count > 3) {
          const circle = L.circle([unit.lat, unit.lng], {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            radius: 800 + (count * 25)
          });
          circle.bindTooltip(`${unit.name} High Density Hotspot (${count} Incidents)`, { permanent: false });
          hotspotsGroupRef.current?.addLayer(circle);
        }
      });
    }

  }, [filteredFIRs, showMarkers, showHotspots, stationFilter]);

  // Rank calculations
  const stationCounts: Record<string, number> = {};
  filteredFIRs.forEach(f => {
    stationCounts[f.unitName] = (stationCounts[f.unitName] || 0) + 1;
  });

  const rankedStations = Object.keys(stationCounts)
    .map(name => ({
      name,
      count: stationCounts[name],
      score: Math.min(100, Math.round(stationCounts[name] * 8.5))
    }))
    .sort((a, b) => b.count - a.count);

  const shiftLabels = [
    "All 24 Hours (00:00 - 24:00)",
    "Shift 1: Morning (06:00 - 12:00)",
    "Shift 2: Afternoon (12:00 - 18:00)",
    "Shift 3: Evening (18:00 - 00:00)",
    "Shift 4: Night (00:00 - 06:00)"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar Controls (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        
        {/* Filter Block 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Map Intelligence Filters</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Crime Type Filter</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
            >
              <option value="ALL">All Crime Types ({firs.length} Incidents)</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Police Station / Unit Drill-down</label>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
            >
              <option value="ALL">All Police Stations ({uniqueStations.length} Jurisdictions)</option>
              {uniqueStations.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-600 block mb-2">Visualization Layers</label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>FIR Incident Markers ({filteredFIRs.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Hotspot Cluster Boundaries</span>
              </label>
            </div>
          </div>
        </div>

        {/* Filter Block 2: Time Slider */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Spatiotemporal Time Shift</span>
          </h3>
          <p className="text-xs text-slate-500">Analyze incident shift concentrations across 24 hours.</p>

          <div>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 mb-2">
              {shiftLabels[timeShift]}
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={timeShift}
              onChange={(e) => setTimeShift(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>All</span>
              <span>S1 (6-12)</span>
              <span>S2 (12-18)</span>
              <span>S3 (18-24)</span>
              <span>S4 (0-6)</span>
            </div>
          </div>
        </div>

        {/* Hotspot Ranking Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Station Hotspot Risk Ranking</span>
          </h3>

          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Station</th>
                  <th className="px-3 py-2">Incidents</th>
                  <th className="px-3 py-2">Risk Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rankedStations.length > 0 ? (
                  rankedStations.map(st => (
                    <tr key={st.name}>
                      <td className="px-3 py-2 text-slate-800 font-bold">{st.name}</td>
                      <td className="px-3 py-2 text-slate-600">{st.count} FIRs</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          st.score > 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {st.score}/100
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 py-3 text-slate-400 text-center">No matching incidents</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Main Map Canvas (8 cols) */}
      <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-200 overflow-hidden shadow-md min-h-[550px] relative flex flex-col">
        
        {/* Leaflet Mount Container */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[550px] flex-1 z-0" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-3 shadow-lg z-10 text-xs space-y-1.5">
          <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Crime Category Markers</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>Body Offences</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Property Crimes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              <span>Cyber Crimes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Narcotics</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
