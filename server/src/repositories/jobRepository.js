const db = require('../config/db');
const store = require('./inMemoryStore');

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class JobRepository {
  async create(jobData) {
    const { employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required } = jobData;
    try {
      const res = await db.query(
        `INSERT INTO jobs (employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'OPEN')
         RETURNING *`,
        [employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required || 1]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const newJob = {
          job_id: store.jobs.length + 1,
          employer_id: parseInt(employer_id, 10),
          title,
          description,
          skill_required,
          wage: parseFloat(wage),
          job_date,
          start_time,
          end_time,
          location,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          workers_required: parseInt(workers_required || 1, 10),
          status: 'OPEN',
          created_at: new Date()
        };
        store.jobs.push(newJob);
        return newJob;
      }
      throw err;
    }
  }

  async findById(job_id) {
    try {
      const res = await db.query(
        `SELECT j.*, e.company_name, e.company_type
         FROM jobs j
         JOIN employers e ON j.employer_id = e.employer_id
         WHERE j.job_id = $1`,
        [job_id]
      );
      return res.rows[0] || null;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const job = store.jobs.find(j => j.job_id === parseInt(job_id, 10));
        if (!job) return null;
        const emp = store.employers.find(e => e.employer_id === job.employer_id);
        return { ...job, company_name: emp?.company_name, company_type: emp?.company_type };
      }
      throw err;
    }
  }

  async update(job_id, updates) {
    const { title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status } = updates;
    try {
      const res = await db.query(
        `UPDATE jobs
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             skill_required = COALESCE($3, skill_required),
             wage = COALESCE($4, wage),
             job_date = COALESCE($5, job_date),
             start_time = COALESCE($6, start_time),
             end_time = COALESCE($7, end_time),
             location = COALESCE($8, location),
             latitude = COALESCE($9, latitude),
             longitude = COALESCE($10, longitude),
             workers_required = COALESCE($11, workers_required),
             status = COALESCE($12, status)
         WHERE job_id = $13
         RETURNING *`,
        [title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status, job_id]
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const job = store.jobs.find(j => j.job_id === parseInt(job_id, 10));
        if (job) Object.assign(job, updates);
        return job || null;
      }
      throw err;
    }
  }

  async delete(job_id) {
    try {
      const res = await db.query(`DELETE FROM jobs WHERE job_id = $1 RETURNING *`, [job_id]);
      return res.rows[0];
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        const idx = store.jobs.findIndex(j => j.job_id === parseInt(job_id, 10));
        if (idx !== -1) {
          const removed = store.jobs.splice(idx, 1);
          return removed[0];
        }
        return null;
      }
      throw err;
    }
  }

  async search({ skill, status, location }) {
    try {
      let sql = `
        SELECT j.*, e.company_name
        FROM jobs j
        JOIN employers e ON j.employer_id = e.employer_id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        params.push(status);
        sql += ` AND j.status = $${params.length}`;
      }
      if (skill) {
        params.push(`%${skill}%`);
        sql += ` AND j.skill_required ILIKE $${params.length}`;
      }
      if (location) {
        params.push(`%${location}%`);
        sql += ` AND j.location ILIKE $${params.length}`;
      }

      sql += ` ORDER BY j.created_at DESC`;

      const res = await db.query(sql, params);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.jobs.filter(j => {
          if (status && j.status !== status) return false;
          if (skill && !j.skill_required.toLowerCase().includes(skill.toLowerCase())) return false;
          if (location && !j.location.toLowerCase().includes(location.toLowerCase())) return false;
          return true;
        }).map(j => {
          const emp = store.employers.find(e => e.employer_id === j.employer_id);
          return { ...j, company_name: emp?.company_name };
        });
      }
      throw err;
    }
  }

  async findNearby(lat, lng, radius_km = 15) {
    try {
      const sql = `
        SELECT j.*, e.company_name,
               (6371 * acos(
                 cos(radians($1)) * cos(radians(j.latitude)) *
                 cos(radians(j.longitude) - radians($2)) +
                 sin(radians($1)) * sin(radians(j.latitude))
               )) AS distance_km
        FROM jobs j
        JOIN employers e ON j.employer_id = e.employer_id
        WHERE j.status = 'OPEN'
        HAVING (6371 * acos(
                 cos(radians($1)) * cos(radians(j.latitude)) *
                 cos(radians(j.longitude) - radians($2)) +
                 sin(radians($1)) * sin(radians(j.latitude))
               )) <= $3
        ORDER BY distance_km ASC
      `;
      const res = await db.query(sql, [lat, lng, radius_km]);
      return res.rows;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !db.isPgConnected()) {
        return store.jobs
          .map(j => {
            const dist = calculateDistanceKm(parseFloat(lat), parseFloat(lng), j.latitude, j.longitude);
            const emp = store.employers.find(e => e.employer_id === j.employer_id);
            return { ...j, company_name: emp?.company_name, distance_km: Math.round(dist * 100) / 100 };
          })
          .filter(j => j.status === 'OPEN' && j.distance_km <= parseFloat(radius_km))
          .sort((a, b) => a.distance_km - b.distance_km);
      }
      throw err;
    }
  }
}

module.exports = new JobRepository();
