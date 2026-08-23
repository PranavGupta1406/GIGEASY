const db = require('../config/db');
const store = require('./inMemoryStore');

class KYCRepository {
  async getStatus(user_id) {
    try {
      const res = await db.query(`SELECT * FROM kyc_verification WHERE user_id = $1`, [user_id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.kyc_verification.find(k => k.user_id === parseInt(user_id, 10)) || null;
      }
      throw err;
    }
  }

  async updateStatus(user_id, { aadhaar_verified, face_verified, digilocker_verified }) {
    try {
      const sql = `
        INSERT INTO kyc_verification (user_id, aadhaar_verified, face_verified, digilocker_verified, verified_at)
        VALUES ($1, COALESCE($2, FALSE), COALESCE($3, FALSE), COALESCE($4, FALSE), CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE
        SET aadhaar_verified = COALESCE($2, kyc_verification.aadhaar_verified),
            face_verified = COALESCE($3, kyc_verification.face_verified),
            digilocker_verified = COALESCE($4, kyc_verification.digilocker_verified),
            verified_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const res = await db.query(sql, [user_id, aadhaar_verified, face_verified, digilocker_verified]);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        let kyc = store.kyc_verification.find(k => k.user_id === parseInt(user_id, 10));
        if (!kyc) {
          kyc = {
            kyc_id: store.kyc_verification.length + 1,
            user_id: parseInt(user_id, 10),
            aadhaar_verified: !!aadhaar_verified,
            face_verified: !!face_verified,
            digilocker_verified: !!digilocker_verified,
            verified_at: new Date()
          };
          store.kyc_verification.push(kyc);
        } else {
          if (aadhaar_verified !== undefined) kyc.aadhaar_verified = aadhaar_verified;
          if (face_verified !== undefined) kyc.face_verified = face_verified;
          if (digilocker_verified !== undefined) kyc.digilocker_verified = digilocker_verified;
          kyc.verified_at = new Date();
        }
        return kyc;
      }
      throw err;
    }
  }
}

module.exports = new KYCRepository();
