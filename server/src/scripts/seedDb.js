const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function seedDb() {
  console.log('Seeding GigEasy PostgreSQL database with sample data...');
  try {
    const seedSql = fs.readFileSync(path.join(__dirname, '../../../database/seeds.sql'), 'utf-8');
    await db.query(seedSql);
    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  seedDb();
}

module.exports = seedDb;
