const db = require('../config/db');

class UserRepository {
  async create({ firebase_uid, role, phone, email }) {
    const res = await db.query(
      `INSERT INTO users (firebase_uid, role, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [firebase_uid, role, phone, email]
    );
    return res.rows[0];
  }

  async findById(user_id) {
    const res = await db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id]);
    return res.rows[0] || null;
  }

  async findByFirebaseUid(firebase_uid) {
    const res = await db.query(`SELECT * FROM users WHERE firebase_uid = $1`, [firebase_uid]);
    return res.rows[0] || null;
  }

  async update(user_id, { role, phone, email }) {
    const res = await db.query(
      `UPDATE users
       SET role = COALESCE($1, role),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email)
       WHERE user_id = $4
       RETURNING *`,
      [role, phone, email, user_id]
    );
    return res.rows[0];
  }
}

module.exports = new UserRepository();
