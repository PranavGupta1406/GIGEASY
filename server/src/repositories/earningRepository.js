const db = require('../config/db');

class EarningRepository {
  async getSummary(worker_id) {
    const sql = `
      SELECT 
        COALESCE(SUM(amount), 0) AS total_earnings,
        COALESCE(SUM(CASE WHEN DATE(payment_date) = CURRENT_DATE THEN amount ELSE 0 END), 0) AS today_earnings,
        COALESCE(SUM(CASE WHEN payment_date >= DATE_TRUNC('week', CURRENT_DATE) THEN amount ELSE 0 END), 0) AS weekly_earnings,
        COALESCE(SUM(CASE WHEN payment_date >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) AS monthly_earnings,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) AS paid_earnings,
        COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END), 0) AS pending_earnings,
        COUNT(earning_id) AS total_payouts
      FROM earnings
      WHERE worker_id = $1
    `;
    const res = await db.query(sql, [worker_id]);
    return res.rows[0];
  }

  async getDaily(worker_id) {
    const sql = `
      SELECT 
        DATE(payment_date) AS date,
        SUM(amount) AS daily_total,
        COUNT(earning_id) AS jobs_completed
      FROM earnings
      WHERE worker_id = $1 AND payment_status = 'PAID'
      GROUP BY DATE(payment_date)
      ORDER BY date DESC
    `;
    const res = await db.query(sql, [worker_id]);
    return res.rows;
  }

  async getMonthly(worker_id) {
    const sql = `
      SELECT 
        TO_CHAR(payment_date, 'YYYY-MM') AS month,
        SUM(amount) AS monthly_total,
        COUNT(earning_id) AS jobs_completed
      FROM earnings
      WHERE worker_id = $1 AND payment_status = 'PAID'
      GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
      ORDER BY month DESC
    `;
    const res = await db.query(sql, [worker_id]);
    return res.rows;
  }

  async getRecent(worker_id) {
    const sql = `
      SELECT e.*, j.title AS job_title, j.location AS job_location, emp.company_name
      FROM earnings e
      JOIN jobs j ON e.job_id = j.job_id
      JOIN employers emp ON j.employer_id = emp.employer_id
      WHERE e.worker_id = $1
      ORDER BY e.payment_date DESC
    `;
    const res = await db.query(sql, [worker_id]);
    return res.rows;
  }

  async create({ worker_id, job_id, amount, payment_status }) {
    const res = await db.query(
      `INSERT INTO earnings (worker_id, job_id, amount, payment_status, payment_date)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [worker_id, job_id, amount, payment_status || 'PAID']
    );
    return res.rows[0];
  }
}

module.exports = new EarningRepository();
