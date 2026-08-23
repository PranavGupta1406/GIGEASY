const db = require('../config/db');

class OrderRepository {
  async checkoutCart(employerId, checkoutData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get Cart Items
      const cartRes = await client.query('SELECT cart_id FROM carts WHERE employer_id = $1', [employerId]);
      if (cartRes.rows.length === 0) throw new Error('Cart not found');
      const cartId = cartRes.rows[0].cart_id;

      const itemsRes = await client.query(
        `SELECT ci.*, s.base_price 
         FROM cart_items ci
         JOIN services s ON ci.service_id = s.service_id
         WHERE ci.cart_id = $1`,
        [cartId]
      );

      if (itemsRes.rows.length === 0) throw new Error('Cart is empty');
      const cartItems = itemsRes.rows;

      // 2. Calculate Total
      let totalAmount = 0;
      cartItems.forEach(item => {
        totalAmount += Number(item.base_price) * item.quantity;
      });

      // 3. Create Order
      const orderRes = await client.query(
        `INSERT INTO orders (employer_id, status, work_site_address, latitude, longitude, contact_person, phone, special_instructions, total_amount)
         VALUES ($1, 'SEARCHING_WORKERS', $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          employerId, checkoutData.work_site_address, checkoutData.latitude, checkoutData.longitude,
          checkoutData.contact_person, checkoutData.phone, checkoutData.special_instructions, totalAmount
        ]
      );
      const order = orderRes.rows[0];

      // 4. Create Order Items and Auto-Match Workers
      for (const item of cartItems) {
        const oiRes = await client.query(
          `INSERT INTO order_items (order_id, service_id, quantity, price, date, shift_time, duration_hours)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [order.order_id, item.service_id, item.quantity, item.base_price, item.date, item.shift_time, item.duration_hours]
        );
        const orderItem = oiRes.rows[0];

        // 5. Auto-Match Workers for this Order Item
        // Find available workers matching the service
        const workersRes = await client.query(
          `SELECT w.worker_id 
           FROM workers w
           JOIN worker_services ws ON w.worker_id = ws.worker_id
           WHERE ws.service_id = $1 AND w.availability = 'AVAILABLE'
           LIMIT $2`,
          [item.service_id, item.quantity]
        );

        // Assign workers
        for (const worker of workersRes.rows) {
          await client.query(
            `INSERT INTO bookings (order_item_id, worker_id, employer_id, booking_status)
             VALUES ($1, $2, $3, 'ASSIGNED')`,
            [orderItem.order_item_id, worker.worker_id, employerId]
          );
        }
      }

      // 6. Clear Cart
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

      // 7. Update Order Status if workers found
      await client.query(`UPDATE orders SET status = 'WORKERS_ASSIGNED' WHERE order_id = $1`, [order.order_id]);

      await client.query('COMMIT');
      return order;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getActiveOrders(employerId) {
    const res = await db.query(
      `SELECT o.*, 
        (SELECT json_agg(row_to_json(oi)) FROM (
          SELECT oi.*, s.name as service_name,
            (SELECT json_agg(row_to_json(b)) FROM (
              SELECT b.*, w.full_name as worker_name, w.profile_photo
              FROM bookings b
              JOIN workers w ON b.worker_id = w.worker_id
              WHERE b.order_item_id = oi.order_item_id
            ) b) as assignments
          FROM order_items oi
          JOIN services s ON oi.service_id = s.service_id
          WHERE oi.order_id = o.order_id
        ) oi) as items
       FROM orders o
       WHERE o.employer_id = $1 AND o.status NOT IN ('COMPLETED', 'CANCELLED')
       ORDER BY o.created_at DESC`,
      [employerId]
    );
    return res.rows;
  }

  async getOrderHistory(employerId) {
    const res = await db.query(
      `SELECT * FROM orders WHERE employer_id = $1 AND status IN ('COMPLETED', 'CANCELLED') ORDER BY created_at DESC`,
      [employerId]
    );
    return res.rows;
  }
}

module.exports = new OrderRepository();
