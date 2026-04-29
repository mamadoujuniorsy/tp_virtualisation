import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// --- Database Configuration ---
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'dic2iabd_db',
};

let pool;

async function initDbWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      pool = mysql.createPool(dbConfig);
      const connection = await pool.getConnection();
      console.log('✅ Connecté à la base de données MySQL');
      connection.release();
      return;
    } catch (err) {
      console.error(`❌ DB Connexion échouée (${i + 1}/${retries})... Attente.`);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error("🚨 Impossible de se connecter à la DB. L'historique ne fonctionnera pas.");
}

initDbWithRetry();

// --- API Routes ---

// API: Historique
app.get('/api/history', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DB indisponible' });
  try {
    const [rows] = await pool.query('SELECT id, date_scan, objects_found, analysis_summary FROM detections ORDER BY date_scan DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur DB' });
  }
});

// API: Sauvegarde
app.post('/api/save', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'DB indisponible' });
  const { objects_found, analysis_summary } = req.body;
  try {
    const query = 'INSERT INTO detections (objects_found, analysis_summary) VALUES (?, ?)';
    await pool.execute(query, [objects_found, analysis_summary || 'En attente']);
    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur sauvegarde' });
  }
});

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});