const db = require('../config/db');
const store = require('./inMemoryStore');

class BookingRepository {
  async create({ job_id, worker_id, employer_id }) {
    try {
      const res = await db.query(
        `INSERT INTO bookings (job_id, worker_id, employer_id, booking_status)
         VALUES ($1, $2, $3, 'CONFIRMED')
         RETURNING *`,
        [job_id, worker_id, employer_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newBooking = {
          booking_id: store.bookings.length + 1,
          job_id: parseInt(job_id, 10),
          worker_id: parseInt(worker_id, 10),
          employer_id: parseInt(employer_id, 10),
          booking_status: 'CONFIRMED',
          created_at: new Date()
        };
        store.bookings.push(newBooking);
        return newBooking;
      }
      throw err;
    }
  }

  async findById(booking_id) {
    try {
      const res = await db.query(
        `SELECT b.*, j.title AS job_title, w.full_name AS worker_name, e.company_name
         FROM bookings b
         JOIN jobs j ON b.job_id = j.job_id
         JOIN workers w ON b.worker_id = w.worker_id
         JOIN employers e ON b.employer_id = e.employer_id
         WHERE b.booking_id = $1`,
        [booking_id]
      );
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const booking = store.bookings.find(b => b.booking_id === parseInt(booking_id, 10));
        if (!booking) return null;
        const job = store.jobs.find(j => j.job_id === booking.job_id);
        const worker = store.workers.find(w => w.worker_id === booking.worker_id);
        const emp = store.employers.find(e => e.employer_id === booking.employer_id);
        return {
          ...booking,
          job_title: job?.title,
          worker_name: worker?.full_name,
          company_name: emp?.company_name
        };
      }
      throw err;
    }
  }

  async updateStatus(booking_id, status) {
    try {
      const res = await db.query(
        `UPDATE bookings
         SET booking_status = $1
         WHERE booking_id = $2
         RETURNING *`,
        [status, booking_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const b = store.bookings.find(booking => booking.booking_id === parseInt(booking_id, 10));
        if (b) b.booking_status = status;
        return b || null;
      }
      throw err;
    }
  }
}

module.exports = new BookingRepository();
