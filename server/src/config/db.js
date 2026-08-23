const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root or server directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'gigeasy',
  connectionTimeoutMillis: 3000,
};

const pool = new Pool(config);

let isPgConnected = false;

pool.on('error', (err) => {
  console.warn('PostgreSQL pool background error:', err.message);
});

// Test connection
pool.query('SELECT 1')
  .then(() => {
    isPgConnected = true;
    console.log(`Connected to PostgreSQL database: ${config.database} on ${config.host}:${config.port}`);
  })
  .catch((err) => {
    console.warn(`PostgreSQL connection notice: ${err.message}. (Make sure PostgreSQL is running on ${config.host}:${config.port})`);
  });

async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.warn(`[DB fallback mode] PostgreSQL not reachable for query: ${text.substring(0, 50)}...`);
    }
    throw error;
  }
}

module.exports = {
  pool,
  query,
  isPgConnected: () => isPgConnected
};
