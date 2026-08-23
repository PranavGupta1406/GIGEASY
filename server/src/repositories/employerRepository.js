const db = require('../config/db');

class EmployerRepository {
  async create({ user_id, company_name, company_type, address, verified }) {
    const res = await db.query(
      `INSERT INTO employers (user_id, company_name, company_type, address, verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, company_name, company_type, address, verified || false]
    );
    return res.rows[0];
  }

  async findById(employer_id) {
    const res = await db.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM jobs j WHERE j.employer_id = e.employer_id) AS total_jobs_posted,
              (SELECT COUNT(*) FROM bookings b WHERE b.employer_id = e.employer_id AND b.booking_status = 'COMPLETED') AS total_completed_jobs,
              COALESCE((SELECT SUM(wage) FROM jobs j JOIN bookings b ON j.job_id = b.job_id WHERE b.employer_id = e.employer_id AND b.booking_status = 'COMPLETED'), 0) AS total_spending
       FROM employers e
       WHERE e.employer_id = $1`,
      [employer_id]
    );
    return res.rows[0] || null;
  }

  async update(employer_id, { company_name, company_type, address, verified }) {
    const res = await db.query(
      `UPDATE employers
       SET company_name = COALESCE($1, company_name),
           company_type = COALESCE($2, company_type),
           address = COALESCE($3, address),
           verified = COALESCE($4, verified)
       WHERE employer_id = $5
       RETURNING *`,
      [company_name, company_type, address, verified, employer_id]
    );
    return res.rows[0];
  }

  async getHistory(employer_id) {
    const sql = `
      SELECT b.*, j.title, w.full_name AS worker_name, j.wage, j.job_date
      FROM bookings b
      JOIN jobs j ON b.job_id = j.job_id
      JOIN workers w ON b.worker_id = w.worker_id
      WHERE b.employer_id = $1
      ORDER BY b.created_at DESC
    `;
    const res = await db.query(sql, [employer_id]);
    return res.rows;
  }
}

module.exports = new EmployerRepository();
