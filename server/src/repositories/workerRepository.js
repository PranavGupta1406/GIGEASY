const db = require('../config/db');

class WorkerRepository {
  async create({ user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified }) {
    const res = await db.query(
      `INSERT INTO workers (user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years || 0, availability || 'AVAILABLE', profile_photo, verified || false]
    );
    return res.rows[0];
  }

  async findById(worker_id) {
    const res = await db.query(
      `SELECT w.*, 
              ARRAY_AGG(s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL) AS skills,
              COALESCE((SELECT AVG(r.rating)::NUMERIC(3,2) FROM ratings r WHERE r.worker_id = w.worker_id), 5.0) AS average_rating,
              (SELECT COUNT(*) FROM bookings b WHERE b.worker_id = w.worker_id AND b.booking_status = 'COMPLETED') AS completed_jobs_count
       FROM workers w
       LEFT JOIN worker_skills ws ON w.worker_id = ws.worker_id
       LEFT JOIN skills s ON ws.skill_id = s.skill_id
       WHERE w.worker_id = $1
       GROUP BY w.worker_id`,
      [worker_id]
    );
    return res.rows[0] || null;
  }

  async update(worker_id, updates) {
    const { full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified } = updates;
    const res = await db.query(
      `UPDATE workers
       SET full_name = COALESCE($1, full_name),
           aadhaar_number = COALESCE($2, aadhaar_number),
           location = COALESCE($3, location),
           latitude = COALESCE($4, latitude),
           longitude = COALESCE($5, longitude),
           experience_years = COALESCE($6, experience_years),
           availability = COALESCE($7, availability),
           profile_photo = COALESCE($8, profile_photo),
           verified = COALESCE($9, verified)
       WHERE worker_id = $10
       RETURNING *`,
      [full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified, worker_id]
    );
    return res.rows[0];
  }

  async search({ skill, location, availability }) {
    let sql = `
      SELECT w.*, 
             ARRAY_AGG(s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL) AS skills,
             COALESCE((SELECT AVG(r.rating)::NUMERIC(3,2) FROM ratings r WHERE r.worker_id = w.worker_id), 5.0) AS average_rating,
             (SELECT COUNT(*) FROM bookings b WHERE b.worker_id = w.worker_id AND b.booking_status = 'COMPLETED') AS completed_jobs_count
      FROM workers w
      LEFT JOIN worker_skills ws ON w.worker_id = ws.worker_id
      LEFT JOIN skills s ON ws.skill_id = s.skill_id
      WHERE 1=1
    `;
    const params = [];

    if (availability) {
      params.push(availability);
      sql += ` AND w.availability = $${params.length}`;
    }

    if (location) {
      params.push(`%${location}%`);
      sql += ` AND w.location ILIKE $${params.length}`;
    }

    sql += ` GROUP BY w.worker_id`;

    if (skill) {
      params.push(`%${skill}%`);
      sql += ` HAVING ARRAY_TO_STRING(ARRAY_AGG(s.skill_name), ',') ILIKE $${params.length}`;
    }

    const res = await db.query(sql, params);
    return res.rows;
  }

  async findTopRated() {
    const sql = `
      SELECT w.*, 
             COALESCE(AVG(r.rating)::NUMERIC(3,2), 5.0) AS average_rating, 
             COUNT(r.rating_id) AS total_ratings
      FROM workers w
      LEFT JOIN ratings r ON w.worker_id = r.worker_id
      GROUP BY w.worker_id
      ORDER BY average_rating DESC, total_ratings DESC
      LIMIT 10
    `;
    const res = await db.query(sql);
    return res.rows;
  }

  async getHistory(worker_id) {
    const sql = `
      SELECT b.*, j.title, j.location, j.wage, e.company_name
      FROM bookings b
      JOIN jobs j ON b.job_id = j.job_id
      JOIN employers e ON b.employer_id = e.employer_id
      WHERE b.worker_id = $1
      ORDER BY b.created_at DESC
    `;
    const res = await db.query(sql, [worker_id]);
    return res.rows;
  }
}

module.exports = new WorkerRepository();
