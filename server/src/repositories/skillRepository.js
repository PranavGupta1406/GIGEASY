const db = require('../config/db');
const store = require('./inMemoryStore');

class SkillRepository {
  async getAll() {
    try {
      const res = await db.query(`SELECT * FROM skills ORDER BY skill_name ASC`);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.skills;
      }
      throw err;
    }
  }

  async add(skill_name) {
    try {
      const res = await db.query(
        `INSERT INTO skills (skill_name) VALUES ($1) RETURNING *`,
        [skill_name]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const existing = store.skills.find(s => s.skill_name.toLowerCase() === skill_name.toLowerCase());
        if (existing) return existing;
        const newSkill = { skill_id: store.skills.length + 1, skill_name };
        store.skills.push(newSkill);
        return newSkill;
      }
      throw err;
    }
  }
}

module.exports = new SkillRepository();
