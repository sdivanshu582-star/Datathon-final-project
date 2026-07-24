export interface FIR {
  id?: string;
  crimeNo: string;
  unit: string;
  unitName: string;
  district: string;
  head: string;
  section: string;
  gravity: 'Heinous' | 'Non-Heinous';
  csType: string;
  status: string;
  ioId: string;
  date: string;
  lat: number;
  lng: number;
  hourOfDay: number;
  modusOperandi?: string;
  stolenAsset?: string;
  suspectsLinked?: string[];
  created_at?: string;
  victimCount?: number;
  accusedCount?: number;
  arrestStatus?: string;
  year?: number;
}

export interface PoliceUnit {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  level: string;
  status: string;
}

export interface Recidivist {
  id: string;
  name: string;
  cases: number;
  mo: string;
  score: number;
  created_at?: string;
}

export interface SupabaseConfigInfo {
  projectName: string;
  projectId: string;
  projectUrl: string;
  rawUrl: string;
  apiKey: string;
}

export interface SupabaseConnectionStatus {
  connected: boolean;
  loading: boolean;
  message: string;
  recordsCount: number;
  tablesFound: string[];
}

export interface KarnatakaCrimeData {
  id: number;
  fir_id: string;
  year: number;
  date: string;
  district: string;
  police_station: string;
  crime_type: string;
  victim_count: number;
  accused_count: number;
  arrest_status: string;
  case_status: string;
  latitude: number;
  longitude: number;
}

export interface LegalProvision {
  id: number;
  category: string;
  offence: string;
  ipc_section: string;
  bns_section: string;
  punishment: string;
}
