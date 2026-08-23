const db = require('../config/db');

class CartRepository {
  async getCart(employerId) {
    // Ensure cart exists
    let cartRes = await db.query('SELECT * FROM carts WHERE employer_id = $1', [employerId]);
    if (cartRes.rows.length === 0) {
      cartRes = await db.query(
        'INSERT INTO carts (employer_id) VALUES ($1) RETURNING *',
        [employerId]
      );
    }
    const cart = cartRes.rows[0];

    // Get items
    const itemsRes = await db.query(
      `SELECT ci.*, s.name as service_name, s.base_price 
       FROM cart_items ci
       JOIN services s ON ci.service_id = s.service_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cart.cart_id]
    );

    return { ...cart, items: itemsRes.rows };
  }

  async addItem(employerId, itemData) {
    const cart = await this.getCart(employerId);
    
    // Check if item already exists in cart for the same date/time
    const existingRes = await db.query(
      `SELECT * FROM cart_items WHERE cart_id = $1 AND service_id = $2 AND date = $3`,
      [cart.cart_id, itemData.service_id, itemData.date]
    );

    if (existingRes.rows.length > 0) {
      // Update quantity
      const newQty = existingRes.rows[0].quantity + itemData.quantity;
      const res = await db.query(
        `UPDATE cart_items SET quantity = $1, shift_time = $2, duration_hours = $3 WHERE cart_item_id = $4 RETURNING *`,
        [newQty, itemData.shift_time || existingRes.rows[0].shift_time, itemData.duration_hours || existingRes.rows[0].duration_hours, existingRes.rows[0].cart_item_id]
      );
      return res.rows[0];
    } else {
      const res = await db.query(
        `INSERT INTO cart_items (cart_id, service_id, quantity, date, shift_time, duration_hours) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cart.cart_id, itemData.service_id, itemData.quantity, itemData.date, itemData.shift_time, itemData.duration_hours]
      );
      return res.rows[0];
    }
  }

  async updateItem(cartItemId, updates) {
    const res = await db.query(
      `UPDATE cart_items SET quantity = $1, date = $2, shift_time = $3, duration_hours = $4 WHERE cart_item_id = $5 RETURNING *`,
      [updates.quantity, updates.date, updates.shift_time, updates.duration_hours, cartItemId]
    );
    return res.rows[0];
  }

  async removeItem(cartItemId) {
    const res = await db.query('DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *', [cartItemId]);
    return res.rows[0];
  }

  async clearCart(employerId) {
    const cartRes = await db.query('SELECT cart_id FROM carts WHERE employer_id = $1', [employerId]);
    if (cartRes.rows.length > 0) {
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartRes.rows[0].cart_id]);
    }
  }
}

module.exports = new CartRepository();
