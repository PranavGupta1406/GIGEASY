const db = require('../config/db');
const store = require('./inMemoryStore');

class RatingRepository {
  async add({ job_id, worker_id, employer_id, rating, review }) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    try {
      const res = await db.query(
        `INSERT INTO ratings (job_id, worker_id, employer_id, rating, review)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [job_id, worker_id, employer_id, rating, review]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newRating = {
          rating_id: store.ratings.length + 1,
          job_id: parseInt(job_id, 10),
          worker_id: parseInt(worker_id, 10),
          employer_id: parseInt(employer_id, 10),
          rating: parseInt(rating, 10),
          review,
          created_at: new Date()
        };
        store.ratings.push(newRating);
        return newRating;
      }
      throw err;
    }
  }

  async findByWorkerOrJob({ worker_id, job_id }) {
    try {
      let sql = `
        SELECT r.*, e.company_name, j.title AS job_title
        FROM ratings r
        JOIN employers e ON r.employer_id = e.employer_id
        JOIN jobs j ON r.job_id = j.job_id
        WHERE 1=1
      `;
      const params = [];

      if (worker_id) {
        params.push(worker_id);
        sql += ` AND r.worker_id = $${params.length}`;
      }
      if (job_id) {
        params.push(job_id);
        sql += ` AND r.job_id = $${params.length}`;
      }

      sql += ` ORDER BY r.created_at DESC`;
      const res = await db.query(sql, params);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.ratings
          .filter(r => {
            if (worker_id && r.worker_id !== parseInt(worker_id, 10)) return false;
            if (job_id && r.job_id !== parseInt(job_id, 10)) return false;
            return true;
          })
          .map(r => {
            const emp = store.employers.find(e => e.employer_id === r.employer_id);
            const job = store.jobs.find(j => j.job_id === r.job_id);
            return {
              ...r,
              company_name: emp?.company_name,
              job_title: job?.title
            };
          });
      }
      throw err;
    }
  }
}

module.exports = new RatingRepository();
