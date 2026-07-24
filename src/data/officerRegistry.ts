export interface RegisteredOfficer {
  officerId: string;
  name: string;
  rank: string;
  district: string;
  pin: string;
  status: 'Active' | 'Revoked';
  addedBy: string;
  createdAt: string;
}

export const INITIAL_OFFICERS: RegisteredOfficer[] = [
  {
    officerId: 'KSP-8821',
    name: 'Inspector Ramesh Kumar',
    rank: 'Police Inspector (PI)',
    district: 'Bengaluru Urban',
    pin: '123456',
    status: 'Active',
    addedBy: 'SCRB Admin',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    officerId: 'KSP-1042',
    name: 'DySP Sunita Patil',
    rank: 'Deputy Superintendent of Police',
    district: 'Mysuru',
    pin: '123456',
    status: 'Active',
    addedBy: 'SCRB Admin',
    createdAt: '2025-01-15T11:30:00Z',
  },
  {
    officerId: 'KSP-3091',
    name: 'Inspector Anand Hegde',
    rank: 'Police Inspector (PI)',
    district: 'Mangaluru',
    pin: '123456',
    status: 'Active',
    addedBy: 'SCRB Admin',
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    officerId: 'ADMIN-001',
    name: 'Website Administrator / Owner',
    rank: 'System Admin',
    district: 'Bengaluru Urban',
    pin: 'admin123',
    status: 'Active',
    addedBy: 'System Root',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const LOCAL_STORAGE_KEY = 'ksp_registered_officers_registry';

export function getRegisteredOfficers(): RegisteredOfficer[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load officer registry', err);
  }
  // Initialize with defaults if empty
  saveRegisteredOfficers(INITIAL_OFFICERS);
  return INITIAL_OFFICERS;
}

export function saveRegisteredOfficers(officers: RegisteredOfficer[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(officers));
  } catch (err) {
    console.error('Failed to save officer registry', err);
  }
}

export function registerNewOfficer(officer: RegisteredOfficer): { success: boolean; message: string } {
  const list = getRegisteredOfficers();
  if (list.some((o) => o.officerId.toUpperCase() === officer.officerId.toUpperCase())) {
    return { success: false, message: `Officer ID ${officer.officerId} is already registered.` };
  }
  list.push(officer);
  saveRegisteredOfficers(list);
  return { success: true, message: `Officer ${officer.name} (${officer.officerId}) successfully registered!` };
}

export function deleteOfficer(officerId: string): void {
  let list = getRegisteredOfficers();
  list = list.filter((o) => o.officerId.toUpperCase() !== officerId.toUpperCase());
  saveRegisteredOfficers(list);
}

export function toggleOfficerStatus(officerId: string): void {
  const list = getRegisteredOfficers();
  const found = list.find((o) => o.officerId.toUpperCase() === officerId.toUpperCase());
  if (found) {
    found.status = found.status === 'Active' ? 'Revoked' : 'Active';
    saveRegisteredOfficers(list);
  }
}
