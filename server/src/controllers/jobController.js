const db = require('../config/db');

class JobController {
  async createJob(req, res, next) {
    try {
      const { employer_id, title, description, skill_required, location, start_date, start_time, end_time, workers_required, min_wage, max_wage } = req.body;
      
      const query = `
        INSERT INTO jobs (
          employer_id, title, description, skill_required, location, 
          start_date, start_time, end_time, workers_required, min_wage, max_wage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [employer_id, title, description, skill_required, location, start_date, start_time, end_time, workers_required, min_wage, max_wage];
      
      const result = await db.query(query, values);
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }

  async getJobsByEmployer(req, res, next) {
    try {
      const employer_id = req.params.employerId;
      const result = await db.query('SELECT * FROM jobs WHERE employer_id = $1 ORDER BY created_at DESC', [employer_id]);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  }

  async getAllJobs(req, res, next) {
    try {
      // For now, get all jobs. Ideally filter out CLOSED/CANCELLED
      const result = await db.query("SELECT * FROM jobs WHERE status = 'HIRING' ORDER BY created_at DESC");
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobController();
