const db = require('../config/db');
const store = require('./inMemoryStore');

class EarningRepository {
  async getSummary(worker_id) {
    try {
      const sql = `
        SELECT 
          COALESCE(SUM(amount), 0) AS total_earnings,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) AS paid_earnings,
          COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END), 0) AS pending_earnings,
          COUNT(earning_id) AS total_payouts
        FROM earnings
        WHERE worker_id = $1
      `;
      const res = await db.query(sql, [worker_id]);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const workerEarnings = store.earnings.filter(e => e.worker_id === parseInt(worker_id, 10));
        const total = workerEarnings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const paid = workerEarnings.filter(e => e.payment_status === 'PAID').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const pending = workerEarnings.filter(e => e.payment_status === 'PENDING').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        return {
          total_earnings: total,
          paid_earnings: paid,
          pending_earnings: pending,
          total_payouts: workerEarnings.length
        };
      }
      throw err;
    }
  }

  async getDaily(worker_id) {
    try {
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
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const workerEarnings = store.earnings.filter(e => e.worker_id === parseInt(worker_id, 10) && e.payment_status === 'PAID');
        const map = {};
        workerEarnings.forEach(e => {
          const d = new Date(e.payment_date).toISOString().split('T')[0];
          if (!map[d]) map[d] = { date: d, daily_total: 0, jobs_completed: 0 };
          map[d].daily_total += parseFloat(e.amount);
          map[d].jobs_completed += 1;
        });
        return Object.values(map);
      }
      throw err;
    }
  }

  async getMonthly(worker_id) {
    try {
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
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const workerEarnings = store.earnings.filter(e => e.worker_id === parseInt(worker_id, 10) && e.payment_status === 'PAID');
        const map = {};
        workerEarnings.forEach(e => {
          const d = new Date(e.payment_date);
          const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!map[monthStr]) map[monthStr] = { month: monthStr, monthly_total: 0, jobs_completed: 0 };
          map[monthStr].monthly_total += parseFloat(e.amount);
          map[monthStr].jobs_completed += 1;
        });
        return Object.values(map);
      }
      throw err;
    }
  }

  async create({ worker_id, job_id, amount, payment_status }) {
    try {
      const res = await db.query(
        `INSERT INTO earnings (worker_id, job_id, amount, payment_status, payment_date)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [worker_id, job_id, amount, payment_status || 'PAID']
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newEarning = {
          earning_id: store.earnings.length + 1,
          worker_id: parseInt(worker_id, 10),
          job_id: parseInt(job_id, 10),
          amount: parseFloat(amount),
          payment_status: payment_status || 'PAID',
          payment_date: new Date()
        };
        store.earnings.push(newEarning);
        return newEarning;
      }
      throw err;
    }
  }
}

module.exports = new EarningRepository();
