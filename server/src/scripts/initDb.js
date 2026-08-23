const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initDb() {
  console.log('Initializing GigEasy PostgreSQL database schema...');
  try {
    const migration1 = fs.readFileSync(path.join(__dirname, '../../../database/migrations/001_initial_schema.sql'), 'utf-8');
    const migration2 = fs.readFileSync(path.join(__dirname, '../../../database/migrations/002_create_indexes.sql'), 'utf-8');

    console.log('Executing Migration 001: Initial Schema...');
    await db.query(migration1);

    console.log('Executing Migration 002: Indexes...');
    await db.query(migration2);

    console.log('✅ Database initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
