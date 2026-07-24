import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase Client Setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uqjdhwvshqollihqwgbr.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_d_1nUrQstB6U_8DYn432FA_Um_e1-KF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// API Routes

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseProject: 'uqjdhwvshqollihqwgbr'
  });
});

// 2. Supabase Diagnostics & Table Inspector
app.get('/api/supabase-status', async (req, res) => {
  try {
    // Check firs table
    const firRes = await supabase.from('firs').select('id', { count: 'exact', head: true });
    // Check karnataka_crime_data table
    const crimeRes = await supabase.from('karnataka_crime_data').select('id', { count: 'exact',head: true });
    // Check legal_provisions table
    const legalRes = await supabase.from('legal_provisions').select('id', { count: 'exact', head: true });

    res.json({
      connected: true,
      endpoint: SUPABASE_URL,
      tables: {
        firs: { exists: !firRes.error, count: firRes.count || 0, error: firRes.error?.message },
        karnataka_crime_data: { exists: !crimeRes.error, count: crimeRes.count || 0, error: crimeRes.error?.message },
        legal_provisions: { exists: !legalRes.error, count: legalRes.count || 0, error: legalRes.error?.message }
      }
    });
  } catch (err: any) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// 3. Fetch Karnataka Crime Data (from public.karnataka_crime_data)
app.get('/api/karnataka-crime-data', async (req, res) => {
  try {
    const { district, crime_type, year, limit = '100' } = req.query;

    let query = supabase.from('karnataka_crime_data').select('*');

    if (district && district !== 'ALL') {
      query = query.eq('district', String(district));
    }
    if (crime_type && crime_type !== 'ALL') {
      query = query.eq('crime_type', String(crime_type));
    }
    if (year && year !== 'ALL') {
      query = query.eq('year', Number(year));
    }

    query = query.order('id', { ascending: true }).limit(Number(limit));

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, count: data?.length || 0, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Fetch Legal Provisions (IPC vs BNS)
app.get('/api/legal-provisions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('legal_provisions').select('*');
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET FIRs
app.get('/api/firs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('firs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.json({ success: true, count: data?.length || 0, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST New FIR
app.post('/api/firs', async (req, res) => {
  try {
    const fir = req.body;
    
    // Save to firs
    const { data: firData } = await supabase.from('firs').insert([fir]).select();

    // Save to karnataka_crime_data
    const crimeRecord = {
      fir_id: fir.crimeNo || fir.fir_id,
      year: fir.date ? new Date(fir.date).getFullYear() : 2026,
      date: fir.date || new Date().toISOString().split('T')[0],
      district: fir.district || 'Bengaluru Urban',
      police_station: fir.unitName || fir.police_station || 'Bengaluru PS',
      crime_type: fir.head || fir.crime_type || 'Property Crimes',
      victim_count: fir.victimCount || fir.victim_count || 1,
      accused_count: fir.accusedCount || fir.accused_count || 1,
      arrest_status: fir.arrestStatus || fir.arrest_status || 'Under Investigation',
      case_status: fir.status || fir.case_status || 'Open',
      latitude: fir.lat || fir.latitude || 12.9716,
      longitude: fir.lng || fir.longitude || 77.5946
    };

    await supabase.from('karnataka_crime_data').insert([crimeRecord]);

    res.json({ success: true, data: (firData && firData[0]) ? firData[0] : fir });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Drishti-KSP Full-Stack Backend running at http://localhost:${PORT}`);
  });
}

startServer();
