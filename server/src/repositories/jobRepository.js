const db = require('../config/db');

class JobRepository {
  async create(jobData) {
    const { employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required } = jobData;
    const res = await db.query(
      `INSERT INTO jobs (employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'OPEN')
       RETURNING *`,
      [employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude || 28.6139, longitude || 77.2090, workers_required || 1]
    );
    return res.rows[0];
  }

  async findById(job_id) {
    const res = await db.query(
      `SELECT j.*, e.company_name, e.company_type,
              (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.job_id) AS applications_count,
              (SELECT COUNT(*) FROM bookings b WHERE b.job_id = j.job_id AND b.booking_status = 'CONFIRMED') AS workers_hired
       FROM jobs j
       JOIN employers e ON j.employer_id = e.employer_id
       WHERE j.job_id = $1`,
      [job_id]
    );
    return res.rows[0] || null;
  }

  async update(job_id, updates) {
    const { title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status } = updates;
    const res = await db.query(
      `UPDATE jobs
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           skill_required = COALESCE($3, skill_required),
           wage = COALESCE($4, wage),
           job_date = COALESCE($5, job_date),
           start_time = COALESCE($6, start_time),
           end_time = COALESCE($7, end_time),
           location = COALESCE($8, location),
           latitude = COALESCE($9, latitude),
           longitude = COALESCE($10, longitude),
           workers_required = COALESCE($11, workers_required),
           status = COALESCE($12, status)
       WHERE job_id = $13
       RETURNING *`,
      [title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status, job_id]
    );
    return res.rows[0];
  }

  async delete(job_id) {
    const res = await db.query(`DELETE FROM jobs WHERE job_id = $1 RETURNING *`, [job_id]);
    return res.rows[0];
  }

  async search({ skill, status, location, employer_id, min_wage, max_wage }) {
    let sql = `
      SELECT j.*, e.company_name, e.company_type,
             (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.job_id) AS applications_count,
             (SELECT COUNT(*) FROM bookings b WHERE b.job_id = j.job_id AND b.booking_status = 'CONFIRMED') AS workers_hired
      FROM jobs j
      JOIN employers e ON j.employer_id = e.employer_id
      WHERE 1=1
    `;
    const params = [];

    if (employer_id) {
      params.push(employer_id);
      sql += ` AND j.employer_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND j.status = $${params.length}`;
    }
    if (skill) {
      params.push(`%${skill}%`);
      sql += ` AND j.skill_required ILIKE $${params.length}`;
    }
    if (location) {
      params.push(`%${location}%`);
      sql += ` AND j.location ILIKE $${params.length}`;
    }
    if (min_wage) {
      params.push(min_wage);
      sql += ` AND j.wage >= $${params.length}`;
    }
    if (max_wage) {
      params.push(max_wage);
      sql += ` AND j.wage <= $${params.length}`;
    }

    sql += ` ORDER BY j.created_at DESC`;

    const res = await db.query(sql, params);
    return res.rows;
  }

  async findNearby(lat, lng, radius_km = 15) {
    const sql = `
      SELECT j.*, e.company_name,
             (6371 * acos(
               cos(radians($1)) * cos(radians(j.latitude)) *
               cos(radians(j.longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(j.latitude))
             )) AS distance_km
      FROM jobs j
      JOIN employers e ON j.employer_id = e.employer_id
      WHERE j.status = 'OPEN'
      HAVING (6371 * acos(
               cos(radians($1)) * cos(radians(j.latitude)) *
               cos(radians(j.longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(j.latitude))
             )) <= $3
      ORDER BY distance_km ASC
    `;
    const res = await db.query(sql, [lat, lng, radius_km]);
    return res.rows;
  }
}

module.exports = new JobRepository();
