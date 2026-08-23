const db = require('../config/db');

class BookingRepository {
  async create({ job_id, worker_id, employer_id }) {
    const res = await db.query(
      `INSERT INTO bookings (job_id, worker_id, employer_id, booking_status, created_at)
       VALUES ($1, $2, $3, 'CONFIRMED', CURRENT_TIMESTAMP)
       RETURNING *`,
      [job_id, worker_id, employer_id]
    );
    return res.rows[0];
  }

  async findById(booking_id) {
    const res = await db.query(
      `SELECT b.*, j.title AS job_title, j.wage, j.location AS job_location,
              w.full_name AS worker_name, w.location AS worker_location,
              e.company_name, e.address AS company_address
       FROM bookings b
       JOIN jobs j ON b.job_id = j.job_id
       JOIN workers w ON b.worker_id = w.worker_id
       JOIN employers e ON b.employer_id = e.employer_id
       WHERE b.booking_id = $1`,
      [booking_id]
    );
    return res.rows[0] || null;
  }

  async findByWorkerOrEmployer({ worker_id, employer_id }) {
    let sql = `
      SELECT b.*, j.title AS job_title, j.description AS job_description, j.wage, j.location AS job_location, j.job_date, j.start_time, j.end_time,
             w.full_name AS worker_name, w.profile_photo AS worker_photo, w.location AS worker_location,
             e.company_name, e.company_type
      FROM bookings b
      JOIN jobs j ON b.job_id = j.job_id
      JOIN workers w ON b.worker_id = w.worker_id
      JOIN employers e ON b.employer_id = e.employer_id
      WHERE 1=1
    `;
    const params = [];

    if (worker_id) {
      params.push(worker_id);
      sql += ` AND b.worker_id = $${params.length}`;
    }
    if (employer_id) {
      params.push(employer_id);
      sql += ` AND b.employer_id = $${params.length}`;
    }

    sql += ` ORDER BY b.created_at DESC`;
    const res = await db.query(sql, params);
    return res.rows;
  }

  async updateStatus(booking_id, status) {
    const res = await db.query(
      `UPDATE bookings
       SET booking_status = $1
       WHERE booking_id = $2
       RETURNING *`,
      [status, booking_id]
    );
    return res.rows[0];
  }

  // Atomic Job Completion Transaction:
  // 1. Mark booking COMPLETED
  // 2. Mark job CLOSED
  // 3. Auto-generate earnings record for worker
  async completeJobTransaction(booking_id) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch booking details
      const bookingRes = await client.query(
        `SELECT b.*, j.wage FROM bookings b JOIN jobs j ON b.job_id = j.job_id WHERE b.booking_id = $1`,
        [booking_id]
      );
      if (bookingRes.rows.length === 0) {
        throw new Error(`Booking with ID ${booking_id} not found`);
      }
      const booking = bookingRes.rows[0];

      // 2. Update booking status to COMPLETED
      const updatedBooking = await client.query(
        `UPDATE bookings SET booking_status = 'COMPLETED' WHERE booking_id = $1 RETURNING *`,
        [booking_id]
      );

      // 3. Update job status to CLOSED
      await client.query(
        `UPDATE jobs SET status = 'CLOSED' WHERE job_id = $1`,
        [booking.job_id]
      );

      // 4. Auto create earnings record
      const earningRes = await client.query(
        `INSERT INTO earnings (worker_id, job_id, amount, payment_status, payment_date)
         VALUES ($1, $2, $3, 'PAID', CURRENT_TIMESTAMP)
         RETURNING *`,
        [booking.worker_id, booking.job_id, booking.wage]
      );

      await client.query('COMMIT');

      return {
        booking: updatedBooking.rows[0],
        earning: earningRes.rows[0]
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new BookingRepository();
