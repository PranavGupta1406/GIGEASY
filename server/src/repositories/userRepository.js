const db = require('../config/db');
const store = require('./inMemoryStore');

class UserRepository {
  async create({ firebase_uid, role, phone, email }) {
    try {
      const res = await db.query(
        `INSERT INTO users (firebase_uid, role, phone, email)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [firebase_uid, role, phone, email]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newUser = {
          user_id: store.users.length + 1,
          firebase_uid,
          role,
          phone,
          email,
          created_at: new Date()
        };
        store.users.push(newUser);
        return newUser;
      }
      throw err;
    }
  }

  async findById(user_id) {
    try {
      const res = await db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.users.find(u => u.user_id === parseInt(user_id, 10)) || null;
      }
      throw err;
    }
  }

  async findByFirebaseUid(firebase_uid) {
    try {
      const res = await db.query(`SELECT * FROM users WHERE firebase_uid = $1`, [firebase_uid]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.users.find(u => u.firebase_uid === firebase_uid) || null;
      }
      throw err;
    }
  }

  async update(user_id, { role, phone, email }) {
    try {
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
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const user = store.users.find(u => u.user_id === parseInt(user_id, 10));
        if (user) {
          if (role) user.role = role;
          if (phone) user.phone = phone;
          if (email) user.email = email;
        }
        return user || null;
      }
      throw err;
    }
  }
}

module.exports = new UserRepository();
