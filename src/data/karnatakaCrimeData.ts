import { KarnatakaCrimeData, FIR } from '../types';

// Exact mapping from KarnatakaCrimeData to FIR
export function mapCrimeDataToFIR(item: KarnatakaCrimeData): FIR {
  const isHeinous = ['Murder', 'Rape', 'Kidnapping', 'Robbery'].includes(item.crime_type);
  
  let section = 'IPC 379 / BNS 303';
  if (item.crime_type === 'Murder') section = 'IPC 302 / BNS 103(1)';
  else if (item.crime_type === 'Theft') section = 'IPC 379 / BNS 303';
  else if (item.crime_type === 'Burglary') section = 'IPC 380 / BNS 305';
  else if (item.crime_type === 'Robbery') section = 'IPC 390/392 / BNS 309';
  else if (item.crime_type === 'Assault') section = 'IPC 351 / BNS 115';
  else if (item.crime_type === 'Cyber Crime') section = 'IT Act 66D / IPC 420';
  else if (item.crime_type === 'Fraud') section = 'IPC 420 / BNS 318(4)';
  else if (item.crime_type === 'Kidnapping') section = 'IPC 363/364A / BNS 140';
  else if (item.crime_type === 'Vehicle Theft') section = 'IPC 379 / BNS 303';
  else if (item.crime_type === 'Rioting') section = 'IPC 147 / BNS 189';
  else if (item.crime_type === 'Rape') section = 'IPC 376 / BNS 64';
  else if (item.crime_type === 'Drug Offence') section = 'NDPS Act Sec 20';

  const stationCode = item.police_station ? item.police_station.split(' ')[0] : item.district;

  return {
    id: String(item.id),
    crimeNo: item.fir_id || `KSP10${String(item.id).padStart(4, '0')}`,
    unit: `PS-${stationCode.substring(0, 4).toUpperCase()}`,
    unitName: item.police_station || `${item.district} PS`,
    district: item.district,
    head: item.crime_type,
    section: section,
    gravity: isHeinous ? 'Heinous' : 'Non-Heinous',
    csType: item.case_status === 'Chargesheet Filed' ? 'A -> Chargesheet' : (item.case_status === 'Closed' ? 'B -> Closed' : 'Under Investigation'),
    status: item.case_status,
    ioId: 'EMP-' + (1000 + (item.id % 45)),
    date: item.date,
    lat: Number(item.latitude),
    lng: Number(item.longitude),
    hourOfDay: (item.id * 7) % 24,
    modusOperandi: `Arrest: ${item.arrest_status} | Victims: ${item.victim_count} | Accused: ${item.accused_count}`,
    stolenAsset: ['Theft', 'Burglary', 'Robbery', 'Vehicle Theft'].includes(item.crime_type) ? 'Jewelry/Cash/Vehicle' : 'N/A',
    victimCount: item.victim_count,
    accusedCount: item.accused_count,
    arrestStatus: item.arrest_status,
    year: item.year
  };
}

// 3,300 Records Generator for offline/local fallback matching the KSP SQL Dump
export function getKarnatakaCrimeDataset(): KarnatakaCrimeData[] {
  const districts = ['Mysuru', 'Ballari', 'Bengaluru Urban', 'Shivamogga', 'Belagavi', 'Mangaluru', 'Tumakuru', 'Udupi', 'Kalaburagi', 'Hubballi-Dharwad'];
  const crimeTypes = ['Murder', 'Theft', 'Burglary', 'Robbery', 'Assault', 'Cyber Crime', 'Fraud', 'Kidnapping', 'Vehicle Theft', 'Rioting', 'Rape', 'Drug Offence'];
  const arrestStatuses = ['Arrested', 'Under Investigation', 'Pending'];
  const caseStatuses = ['Closed', 'Open', 'Chargesheet Filed'];

  // Coordinates base by district
  const districtCoords: Record<string, { lat: number; lng: number }> = {
    'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 },
    'Mysuru': { lat: 12.2958, lng: 76.6394 },
    'Ballari': { lat: 15.1394, lng: 76.9214 },
    'Shivamogga': { lat: 13.9299, lng: 75.5681 },
    'Belagavi': { lat: 15.8497, lng: 74.4977 },
    'Mangaluru': { lat: 12.9141, lng: 74.8560 },
    'Tumakuru': { lat: 13.3379, lng: 77.1173 },
    'Udupi': { lat: 13.3409, lng: 74.7421 },
    'Kalaburagi': { lat: 17.3297, lng: 76.8343 },
    'Hubballi-Dharwad': { lat: 15.3647, lng: 75.1240 }
  };

  const dataset: KarnatakaCrimeData[] = [];

  for (let i = 1; i <= 3300; i++) {
    const year = 2015 + Math.floor((i - 1) / 300);
    const districtIndex = (i * 3 + Math.floor(i / 11)) % districts.length;
    const district = districts[districtIndex];
    const policeStation = `${district} PS`;
    const crimeType = crimeTypes[(i * 7 + Math.floor(i / 13)) % crimeTypes.length];
    const victimCount = (i % 5) + 1;
    const accusedCount = i % 5;
    const arrestStatus = arrestStatuses[(i + 1) % arrestStatuses.length];
    const caseStatus = caseStatuses[(i + 2) % caseStatuses.length];

    const baseCoord = districtCoords[district] || { lat: 14.5, lng: 75.8 };
    // Spread coordinates naturally within district bounds
    const latOffset = ((Math.sin(i * 1.7) * 0.45));
    const lngOffset = ((Math.cos(i * 2.3) * 0.45));

    // Pad month/day realistically
    const month = String(((i * 3) % 12) + 1).padStart(2, '0');
    const day = String(((i * 5) % 28) + 1).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    dataset.push({
      id: i,
      fir_id: `KSP1${String(i).padStart(5, '0')}`,
      year,
      date,
      district,
      police_station: policeStation,
      crime_type: crimeType,
      victim_count: victimCount,
      accused_count: accusedCount,
      arrest_status: arrestStatus,
      case_status: caseStatus,
      latitude: Number((baseCoord.lat + latOffset).toFixed(6)),
      longitude: Number((baseCoord.lng + lngOffset).toFixed(6))
    });
  }

  return dataset;
}

export function getInitialFIRs(): FIR[] {
  return getKarnatakaCrimeDataset().map(mapCrimeDataToFIR);
}
