const db = require('../config/db');
const store = require('../repositories/inMemoryStore');

class AnalyticsService {
  async getDashboardStats() {
    try {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM workers) AS total_workers,
          (SELECT COUNT(*) FROM employers) AS total_employers,
          (SELECT COUNT(*) FROM jobs WHERE status = 'OPEN') AS open_jobs,
          (SELECT COUNT(*) FROM bookings WHERE booking_status = 'COMPLETED') AS completed_bookings,
          (SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE payment_status = 'PAID') AS total_payouts
      `;
      const res = await db.query(sql);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const totalPayouts = store.earnings.filter(e => e.payment_status === 'PAID').reduce((sum, e) => sum + parseFloat(e.amount), 0);
        return {
          total_users: store.users.length,
          total_workers: store.workers.length,
          total_employers: store.employers.length,
          open_jobs: store.jobs.filter(j => j.status === 'OPEN').length,
          completed_bookings: store.bookings.filter(b => b.booking_status === 'COMPLETED').length,
          total_payouts: totalPayouts
        };
      }
      throw err;
    }
  }
}

module.exports = new AnalyticsService();
