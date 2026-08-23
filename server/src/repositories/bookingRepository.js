const db = require('../config/db');

class BookingRepository {
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
  // 2. Auto-generate earnings record for worker
  async completeJobTransaction(booking_id) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch booking details
      const bookingRes = await client.query(
        `SELECT b.*, oi.price, oi.order_id 
         FROM bookings b 
         JOIN order_items oi ON b.order_item_id = oi.order_item_id 
         WHERE b.booking_id = $1`,
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

      // 3. Auto create earnings record
      const earningRes = await client.query(
        `INSERT INTO earnings (worker_id, booking_id, amount, payment_status, payment_date)
         VALUES ($1, $2, $3, 'PAID', CURRENT_TIMESTAMP)
         RETURNING *`,
        [booking.worker_id, booking.booking_id, booking.price]
      );

      // 4. Check if all bookings for the order are completed, if so, update order status
      const orderBookingsRes = await client.query(
        `SELECT booking_status FROM bookings b 
         JOIN order_items oi ON b.order_item_id = oi.order_item_id 
         WHERE oi.order_id = $1`,
        [booking.order_id]
      );
      
      const allCompleted = orderBookingsRes.rows.every(b => b.booking_status === 'COMPLETED');
      if (allCompleted) {
        await client.query(
          `UPDATE orders SET status = 'COMPLETED' WHERE order_id = $1`,
          [booking.order_id]
        );
      }

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
