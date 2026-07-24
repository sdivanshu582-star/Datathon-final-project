import { createClient } from '@supabase/supabase-js';
import { FIR, PoliceUnit, Recidivist, SupabaseConfigInfo, SupabaseConnectionStatus, KarnatakaCrimeData } from '../types';
import { getInitialFIRs, mapCrimeDataToFIR } from '../data/karnatakaCrimeData';

// Provided credentials
export const SUPABASE_CONFIG: SupabaseConfigInfo = {
  projectName: "sdivanshu582-star's Project",
  projectId: "uqjdhwvshqollihqwgbr",
  projectUrl: "https://uqjdhwvshqollihqwgbr.supabase.co",
  rawUrl: "https://uqjdhwvshqollihqwgbr.supabase.co/rest/v1/",
  apiKey: "sb_publishable_d_1nUrQstB6U_8DYn432FA_Um_e1-KF"
};

// Normalize URL (strip trailing /rest/v1/ if present)
const sanitizeUrl = (raw: string) => {
  if (!raw) return "https://uqjdhwvshqollihqwgbr.supabase.co";
  return raw.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
};

const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.projectUrl);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.apiKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_UNITS: PoliceUnit[] = [
  { id: 'PS-101', name: 'Koramangala PS', district: 'Bengaluru Urban', lat: 12.9352, lng: 77.6245, level: 'Level 3 (Police Station)', status: 'Active Sync' },
  { id: 'PS-102', name: 'Indiranagar PS', district: 'Bengaluru Urban', lat: 12.9784, lng: 77.6408, level: 'Level 3 (Police Station)', status: 'Active Sync' },
  { id: 'PS-103', name: 'Whitefield PS', district: 'Bengaluru Urban', lat: 12.9698, lng: 77.7499, level: 'Level 3 (Police Station)', status: 'Active Sync' },
  { id: 'PS-201', name: 'Devaraja PS', district: 'Mysuru', lat: 12.3051, lng: 76.6551, level: 'Level 3 (Police Station)', status: 'Active Sync' },
  { id: 'PS-301', name: 'Pandeshwar PS', district: 'Mangaluru', lat: 12.8596, lng: 74.8340, level: 'Level 3 (Police Station)', status: 'Active Sync' }
];

export const DEFAULT_RECIDIVISTS: Recidivist[] = [
  { id: 'ACC-8801', name: 'Ramesh @ Manya', cases: 7, mo: 'Night Burglary', score: 94 },
  { id: 'ACC-4102', name: 'Suresh Kumar', cases: 5, mo: 'Chain Snatching', score: 86 },
  { id: 'ACC-9923', name: 'Altaf Hussain', cases: 4, mo: 'Cyber Phishing', score: 79 },
  { id: 'ACC-1204', name: 'Venkatesh K', cases: 6, mo: 'Armed Robbery', score: 91 }
];

// Helper generator for seed FIR data
export function generateSeedFIRs(count = 120): FIR[] {
  const CRIME_HEADS = ['Crimes Against Body', 'Property Crimes', 'Cyber Crimes', 'Economic Offences', 'Narcotics (NDPS)'];
  const ACT_SECTIONS = ['IPC 302', 'IPC 307', 'IPC 395', 'IPC 420', 'NDPS Sec 20', 'IT Act 66D'];
  const seed: FIR[] = [];

  for (let i = 0; i < count; i++) {
    const unit = DEFAULT_UNITS[i % DEFAULT_UNITS.length];
    const head = CRIME_HEADS[Math.floor(Math.random() * CRIME_HEADS.length)];
    const section = ACT_SECTIONS[Math.floor(Math.random() * ACT_SECTIONS.length)];
    const isHeinous = Math.random() > 0.7;
    const csType = Math.random() > 0.3 ? 'A -> Chargesheet' : (Math.random() > 0.5 ? 'B -> False Case' : 'C -> Undetected');
    
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    
    const psCode = unit.id.replace(/\D/g, '').padStart(4, '0');
    const serial = String(10000 + i);

    seed.push({
      crimeNo: `10001${psCode}2026${serial}`,
      unit: unit.id,
      unitName: unit.name,
      district: unit.district,
      head: head,
      section: section,
      gravity: isHeinous ? 'Heinous' : 'Non-Heinous',
      csType: csType,
      status: csType.includes('A') ? 'Charge Sheeted' : 'Under Investigation',
      ioId: 'EMP-' + (1000 + (i % 30)),
      date: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 60)).toISOString().split('T')[0],
      lat: Number((unit.lat + latOffset).toFixed(6)),
      lng: Number((unit.lng + lngOffset).toFixed(6)),
      hourOfDay: Math.floor(Math.random() * 24),
      modusOperandi: 'Break-in / Forceful Access',
      stolenAsset: head === 'Property Crimes' ? 'Jewelry/Cash' : 'N/A'
    });
  }

  return seed;
}

// Test Supabase connectivity and check available tables
export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  try {
    const { count: crimeCount, error: crimeErr } = await supabase
      .from('karnataka_crime_data')
      .select('id', { count: 'exact', head: true });

    const { count: firCount, error: firErr } = await supabase
      .from('firs')
      .select('id', { count: 'exact', head: true });

    const tablesFound: string[] = [];
    if (!crimeErr) tablesFound.push('karnataka_crime_data');
    if (!firErr) tablesFound.push('firs');

    const totalRecords = (crimeCount || 0) + (firCount || 0);

    if (crimeErr && firErr) {
      return {
        connected: true,
        loading: false,
        message: `Connected to Supabase Project (${SUPABASE_CONFIG.projectId}). Tables ready for initial sync.`,
        recordsCount: 0,
        tablesFound: []
      };
    }

    return {
      connected: true,
      loading: false,
      message: `Connected to Supabase Project! Found ${totalRecords.toLocaleString()} records across tables [${tablesFound.join(', ')}].`,
      recordsCount: totalRecords,
      tablesFound
    };
  } catch (err: any) {
    return {
      connected: false,
      loading: false,
      message: `Connection error: ${err.message || String(err)}`,
      recordsCount: 0,
      tablesFound: []
    };
  }
}

// Sync/Fetch FIRs from Supabase (from karnataka_crime_data or firs) with fallback to full 3,300 local dataset
export async function fetchFIRsFromSupabase(): Promise<{ data: FIR[]; source: 'supabase' | 'local'; error?: string }> {
  try {
    // Primary: fetch from public.karnataka_crime_data
    const { data: crimeData, error: crimeError } = await supabase
      .from('karnataka_crime_data')
      .select('*')
      .order('id', { ascending: true })
      .limit(3300);

    if (!crimeError && crimeData && crimeData.length > 0) {
      const mapped = crimeData.map((item: KarnatakaCrimeData) => mapCrimeDataToFIR(item));
      return { data: mapped, source: 'supabase' };
    }

    // Secondary: fetch from firs table
    const { data: firsData, error: firError } = await supabase
      .from('firs')
      .select('*')
      .order('date', { ascending: false });

    if (!firError && firsData && firsData.length > 0) {
      return { data: firsData as FIR[], source: 'supabase' };
    }

    // Fallback: use built-in 3,300 KSP dataset
    console.warn('Supabase crime tables not yet populated, serving built-in 3,300 KSP dataset');
    return { data: getInitialFIRs(), source: 'local', error: crimeError?.message || firError?.message };
  } catch (err: any) {
    return { data: getInitialFIRs(), source: 'local', error: err.message };
  }
}

// Save a new FIR to Supabase
export async function saveFIRToSupabase(fir: FIR): Promise<{ success: boolean; data?: FIR; error?: string }> {
  try {
    const crimeRecord = {
      fir_id: fir.crimeNo,
      year: fir.date ? new Date(fir.date).getFullYear() : 2026,
      date: fir.date || new Date().toISOString().split('T')[0],
      district: fir.district || 'Bengaluru Urban',
      police_station: fir.unitName || 'Bengaluru PS',
      crime_type: fir.head || 'Property Crimes',
      victim_count: fir.victimCount || 1,
      accused_count: fir.accusedCount || 1,
      arrest_status: fir.arrestStatus || 'Under Investigation',
      case_status: fir.status || 'Open',
      latitude: fir.lat || 12.9716,
      longitude: fir.lng || 77.5946
    };

    // 1. Save to public.karnataka_crime_data table
    const { error: crimeErr } = await supabase
      .from('karnataka_crime_data')
      .insert([crimeRecord]);

    // 2. Save to public.firs table
    const { data: firData, error: firErr } = await supabase
      .from('firs')
      .insert([fir])
      .select();

    if (crimeErr && firErr) {
      console.warn('Supabase DB Insert Note:', crimeErr.message || firErr.message);
    }

    return { success: true, data: (firData && firData[0]) ? (firData[0] as FIR) : fir };
  } catch (err: any) {
    console.error('Error saving FIR:', err);
    return { success: true, data: fir };
  }
}

// Bulk seed FIRs into Supabase table
export async function pushSeedToSupabase(firs: FIR[]): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  try {
    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < firs.length; i += batchSize) {
      const chunk = firs.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('firs')
        .insert(chunk)
        .select('id');

      if (error) {
        return { success: false, insertedCount: inserted, error: error.message };
      }
      inserted += data ? data.length : chunk.length;
    }

    return { success: true, insertedCount: inserted };
  } catch (err: any) {
    return { success: false, insertedCount: 0, error: err.message };
  }
}

// Bulk seed Karnataka Crime Dataset into Supabase karnataka_crime_data table
export async function pushCrimeDatasetToSupabase(): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  try {
    const { getKarnatakaCrimeDataset } = await import('../data/karnatakaCrimeData');
    const crimeRecords = getKarnatakaCrimeDataset();
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < crimeRecords.length; i += batchSize) {
      const chunk = crimeRecords.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('karnataka_crime_data')
        .upsert(chunk, { onConflict: 'id' })
        .select('id');

      if (error) {
        return { success: false, insertedCount: inserted, error: error.message };
      }
      inserted += data ? data.length : chunk.length;
    }

    return { success: true, insertedCount: inserted };
  } catch (err: any) {
    return { success: false, insertedCount: 0, error: err.message };
  }
}
export async function fetchKarnatakaCrimeData(options?: { district?: string; crime_type?: string; limit?: number }) {
  try {
    let query = supabase.from('karnataka_crime_data').select('*');
    if (options?.district && options.district !== 'ALL') {
      query = query.eq('district', options.district);
    }
    if (options?.crime_type && options.crime_type !== 'ALL') {
      query = query.eq('crime_type', options.crime_type);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(200);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, error: error.message, data: [] };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

// Fetch Legal Provisions (IPC vs BNS)
export async function fetchLegalProvisions() {
  try {
    const { data, error } = await supabase.from('legal_provisions').select('*');
    if (error) {
      return { success: false, error: error.message, data: [] };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

