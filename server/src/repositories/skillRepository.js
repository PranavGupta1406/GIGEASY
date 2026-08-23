const db = require('../config/db');

class SkillRepository {
  async getAll() {
    const res = await db.query(`SELECT * FROM skills ORDER BY skill_name ASC`);
    return res.rows;
  }

  async add(skill_name) {
    const res = await db.query(
      `INSERT INTO skills (skill_name) VALUES ($1) ON CONFLICT (skill_name) DO UPDATE SET skill_name = EXCLUDED.skill_name RETURNING *`,
      [skill_name]
    );
    return res.rows[0];
  }
}

module.exports = new SkillRepository();
