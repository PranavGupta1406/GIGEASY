const db = require('../config/db');
const store = require('./inMemoryStore');

class WorkerRepository {
  async create({ user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified }) {
    try {
      const res = await db.query(
        `INSERT INTO workers (user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years || 0, availability || 'AVAILABLE', profile_photo, verified || false]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newWorker = {
          worker_id: store.workers.length + 1,
          user_id: parseInt(user_id, 10),
          full_name,
          aadhaar_number,
          location,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          experience_years: parseFloat(experience_years || 0),
          availability: availability || 'AVAILABLE',
          profile_photo,
          verified: !!verified,
          created_at: new Date()
        };
        store.workers.push(newWorker);
        return newWorker;
      }
      throw err;
    }
  }

  async findById(worker_id) {
    try {
      const res = await db.query(
        `SELECT w.*, 
                ARRAY_AGG(s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL) AS skills
         FROM workers w
         LEFT JOIN worker_skills ws ON w.worker_id = ws.worker_id
         LEFT JOIN skills s ON ws.skill_id = s.skill_id
         WHERE w.worker_id = $1
         GROUP BY w.worker_id`,
        [worker_id]
      );
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const worker = store.workers.find(w => w.worker_id === parseInt(worker_id, 10));
        if (!worker) return null;
        const wSkills = store.worker_skills
          .filter(ws => ws.worker_id === worker.worker_id)
          .map(ws => store.skills.find(s => s.skill_id === ws.skill_id)?.skill_name)
          .filter(Boolean);
        return { ...worker, skills: wSkills };
      }
      throw err;
    }
  }

  async update(worker_id, updates) {
    const { full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified } = updates;
    try {
      const res = await db.query(
        `UPDATE workers
         SET full_name = COALESCE($1, full_name),
             aadhaar_number = COALESCE($2, aadhaar_number),
             location = COALESCE($3, location),
             latitude = COALESCE($4, latitude),
             longitude = COALESCE($5, longitude),
             experience_years = COALESCE($6, experience_years),
             availability = COALESCE($7, availability),
             profile_photo = COALESCE($8, profile_photo),
             verified = COALESCE($9, verified)
         WHERE worker_id = $10
         RETURNING *`,
        [full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified, worker_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const worker = store.workers.find(w => w.worker_id === parseInt(worker_id, 10));
        if (worker) {
          Object.assign(worker, updates);
        }
        return worker || null;
      }
      throw err;
    }
  }

  async search({ skill, location, availability }) {
    try {
      let sql = `
        SELECT w.*, ARRAY_AGG(s.skill_name) FILTER (WHERE s.skill_name IS NOT NULL) AS skills
        FROM workers w
        LEFT JOIN worker_skills ws ON w.worker_id = ws.worker_id
        LEFT JOIN skills s ON ws.skill_id = s.skill_id
        WHERE 1=1
      `;
      const params = [];

      if (availability) {
        params.push(availability);
        sql += ` AND w.availability = $${params.length}`;
      }

      if (location) {
        params.push(`%${location}%`);
        sql += ` AND w.location ILIKE $${params.length}`;
      }

      sql += ` GROUP BY w.worker_id`;

      if (skill) {
        params.push(`%${skill}%`);
        sql += ` HAVING ARRAY_TO_STRING(ARRAY_AGG(s.skill_name), ',') ILIKE $${params.length}`;
      }

      const res = await db.query(sql, params);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.workers.filter(w => {
          if (availability && w.availability !== availability) return false;
          if (location && !w.location.toLowerCase().includes(location.toLowerCase())) return false;
          return true;
        }).map(worker => {
          const wSkills = store.worker_skills
            .filter(ws => ws.worker_id === worker.worker_id)
            .map(ws => store.skills.find(s => s.skill_id === ws.skill_id)?.skill_name)
            .filter(Boolean);
          return { ...worker, skills: wSkills };
        });
      }
      throw err;
    }
  }

  async findTopRated() {
    try {
      const sql = `
        SELECT w.*, AVG(r.rating)::NUMERIC(3,2) AS average_rating, COUNT(r.rating_id) AS total_ratings
        FROM workers w
        JOIN ratings r ON w.worker_id = r.worker_id
        GROUP BY w.worker_id
        ORDER BY average_rating DESC, total_ratings DESC
        LIMIT 10
      `;
      const res = await db.query(sql);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.workers.map(w => {
          const wRatings = store.ratings.filter(r => r.worker_id === w.worker_id);
          const avg = wRatings.length > 0 ? (wRatings.reduce((a, b) => a + b.rating, 0) / wRatings.length).toFixed(2) : 5.0;
          return { ...w, average_rating: parseFloat(avg), total_ratings: wRatings.length };
        });
      }
      throw err;
    }
  }

  async getHistory(worker_id) {
    try {
      const sql = `
        SELECT b.*, j.title, j.location, j.wage, e.company_name
        FROM bookings b
        JOIN jobs j ON b.job_id = j.job_id
        JOIN employers e ON b.employer_id = e.employer_id
        WHERE b.worker_id = $1
        ORDER BY b.created_at DESC
      `;
      const res = await db.query(sql, [worker_id]);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.bookings
          .filter(b => b.worker_id === parseInt(worker_id, 10))
          .map(b => {
            const job = store.jobs.find(j => j.job_id === b.job_id);
            const emp = store.employers.find(e => e.employer_id === b.employer_id);
            return {
              ...b,
              title: job?.title,
              location: job?.location,
              wage: job?.wage,
              company_name: emp?.company_name
            };
          });
      }
      throw err;
    }
  }
}

module.exports = new WorkerRepository();
