const db = require('../config/db');
const store = require('./inMemoryStore');

class ApplicationRepository {
  async apply({ job_id, worker_id }) {
    try {
      const res = await db.query(
        `INSERT INTO job_applications (job_id, worker_id, application_status)
         VALUES ($1, $2, 'PENDING')
         RETURNING *`,
        [job_id, worker_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newApp = {
          application_id: store.job_applications.length + 1,
          job_id: parseInt(job_id, 10),
          worker_id: parseInt(worker_id, 10),
          application_status: 'PENDING',
          applied_at: new Date()
        };
        store.job_applications.push(newApp);
        return newApp;
      }
      throw err;
    }
  }

  async findById(application_id) {
    try {
      const res = await db.query(`SELECT * FROM job_applications WHERE application_id = $1`, [application_id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.job_applications.find(a => a.application_id === parseInt(application_id, 10)) || null;
      }
      throw err;
    }
  }

  async updateStatus(application_id, status) {
    try {
      const res = await db.query(
        `UPDATE job_applications
         SET application_status = $1
         WHERE application_id = $2
         RETURNING *`,
        [status, application_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const app = store.job_applications.find(a => a.application_id === parseInt(application_id, 10));
        if (app) app.application_status = status;
        return app || null;
      }
      throw err;
    }
  }

  async findByJobOrWorker({ job_id, worker_id }) {
    try {
      let sql = `
        SELECT ja.*, j.title AS job_title, w.full_name AS worker_name, w.location AS worker_location
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.job_id
        JOIN workers w ON ja.worker_id = w.worker_id
        WHERE 1=1
      `;
      const params = [];

      if (job_id) {
        params.push(job_id);
        sql += ` AND ja.job_id = $${params.length}`;
      }
      if (worker_id) {
        params.push(worker_id);
        sql += ` AND ja.worker_id = $${params.length}`;
      }

      sql += ` ORDER BY ja.applied_at DESC`;
      const res = await db.query(sql, params);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.job_applications
          .filter(a => {
            if (job_id && a.job_id !== parseInt(job_id, 10)) return false;
            if (worker_id && a.worker_id !== parseInt(worker_id, 10)) return false;
            return true;
          })
          .map(a => {
            const job = store.jobs.find(j => j.job_id === a.job_id);
            const worker = store.workers.find(w => w.worker_id === a.worker_id);
            return {
              ...a,
              job_title: job?.title,
              worker_name: worker?.full_name,
              worker_location: worker?.location
            };
          });
      }
      throw err;
    }
  }
}

module.exports = new ApplicationRepository();
