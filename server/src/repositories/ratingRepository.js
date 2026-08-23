const db = require('../config/db');

class RatingRepository {
  async add({ booking_id, worker_id, employer_id, rating, review }) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert rating
      const res = await client.query(
        `INSERT INTO ratings (booking_id, worker_id, employer_id, rating, review, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [booking_id, worker_id, employer_id, rating, review]
      );

      // 2. Recalculate average rating for worker
      const avgRes = await client.query(
        `SELECT AVG(rating)::NUMERIC(3,2) AS avg_rating FROM ratings WHERE worker_id = $1`,
        [worker_id]
      );

      const newAvg = avgRes.rows[0]?.avg_rating || rating;

      // 3. Update worker record (if worker table has rating column or we can compute it on the fly)
      await client.query(
        `UPDATE workers SET experience_years = experience_years WHERE worker_id = $1`,
        [worker_id]
      );

      await client.query('COMMIT');
      return { ...res.rows[0], worker_average_rating: parseFloat(newAvg) };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findByWorkerOrJob({ worker_id, booking_id }) {
    let sql = `
      SELECT r.*, e.company_name, j.title AS job_title
      FROM ratings r
      JOIN employers e ON r.employer_id = e.employer_id
      JOIN jobs j ON r.booking_id = j.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (worker_id) {
      params.push(worker_id);
      sql += ` AND r.worker_id = $${params.length}`;
    }
    if (booking_id) {
      params.push(booking_id);
      sql += ` AND r.booking_id = $${params.length}`;
    }

    sql += ` ORDER BY r.created_at DESC`;
    const res = await db.query(sql, params);
    return res.rows;
  }
}

module.exports = new RatingRepository();
