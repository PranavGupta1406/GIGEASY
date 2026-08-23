const db = require('../config/db');
const store = require('./inMemoryStore');

class EmployerRepository {
  async create({ user_id, company_name, company_type, address, verified }) {
    try {
      const res = await db.query(
        `INSERT INTO employers (user_id, company_name, company_type, address, verified)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, company_name, company_type, address, verified || false]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newEmployer = {
          employer_id: store.employers.length + 1,
          user_id: parseInt(user_id, 10),
          company_name,
          company_type,
          address,
          verified: !!verified,
          created_at: new Date()
        };
        store.employers.push(newEmployer);
        return newEmployer;
      }
      throw err;
    }
  }

  async findById(employer_id) {
    try {
      const res = await db.query(`SELECT * FROM employers WHERE employer_id = $1`, [employer_id]);
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.employers.find(e => e.employer_id === parseInt(employer_id, 10)) || null;
      }
      throw err;
    }
  }

  async update(employer_id, { company_name, company_type, address, verified }) {
    try {
      const res = await db.query(
        `UPDATE employers
         SET company_name = COALESCE($1, company_name),
             company_type = COALESCE($2, company_type),
             address = COALESCE($3, address),
             verified = COALESCE($4, verified)
         WHERE employer_id = $5
         RETURNING *`,
        [company_name, company_type, address, verified, employer_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const emp = store.employers.find(e => e.employer_id === parseInt(employer_id, 10));
        if (emp) {
          if (company_name) emp.company_name = company_name;
          if (company_type) emp.company_type = company_type;
          if (address) emp.address = address;
          if (verified !== undefined) emp.verified = verified;
        }
        return emp || null;
      }
      throw err;
    }
  }

  async getHistory(employer_id) {
    try {
      const sql = `
        SELECT b.*, j.title, w.full_name AS worker_name, j.wage, j.job_date
        FROM bookings b
        JOIN jobs j ON b.job_id = j.job_id
        JOIN workers w ON b.worker_id = w.worker_id
        WHERE b.employer_id = $1
        ORDER BY b.created_at DESC
      `;
      const res = await db.query(sql, [employer_id]);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.bookings
          .filter(b => b.employer_id === parseInt(employer_id, 10))
          .map(b => {
            const job = store.jobs.find(j => j.job_id === b.job_id);
            const worker = store.workers.find(w => w.worker_id === b.worker_id);
            return {
              ...b,
              title: job?.title,
              worker_name: worker?.full_name,
              wage: job?.wage,
              job_date: job?.job_date
            };
          });
      }
      throw err;
    }
  }
}

module.exports = new EmployerRepository();
