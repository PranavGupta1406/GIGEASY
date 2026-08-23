// GigEasy Real-Time PostgreSQL Server
// REST API & WebSocket Realtime Gateway for Marketplace Data

import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { pool, isDbConnected, memoryDb, initDatabase } from './db';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/realtime' });

// Connected WebSocket clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`🔌 WebSocket client connected (Total: ${clients.size})`);

  ws.send(JSON.stringify({ event: 'CONNECTED', payload: { timestamp: new Date().toISOString() } }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`🔌 WebSocket client disconnected (Total: ${clients.size})`);
  });
});

/**
 * Broadcast event to all connected WebSocket clients
 */
export function broadcast(event: string, payload: any) {
  const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// ─── REST ENDPOINTS ───────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: isDbConnected ? 'PostgreSQL (Connected)' : 'Memory Fallback (Active)',
    activeRealtimeClients: clients.size,
    timestamp: new Date().toISOString(),
  });
});

// 1. User Sync
app.post('/api/users/sync', async (req: Request, res: Response) => {
  const { id, email, phone_number, role, name, verification_status } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User id is required' });
  }

  memoryDb.users.set(id, req.body);

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO users (id, email, phone_number, role, name, verification_status, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email,
             phone_number = EXCLUDED.phone_number,
             role = EXCLUDED.role,
             name = EXCLUDED.name,
             verification_status = EXCLUDED.verification_status,
             updated_at = CURRENT_TIMESTAMP`,
        [id, email, phone_number, role, name, verification_status]
      );
    } catch (err: any) {
      console.warn('Postgres user write fallback:', err.message);
    }
  }

  broadcast('USER_UPDATED', req.body);
  res.json({ success: true, user: req.body });
});

// 2. Worker Profile Sync
app.post('/api/workers/sync', async (req: Request, res: Response) => {
  const { id, user_id, name, city, state, expected_daily_wage, skills } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Worker id is required' });
  }

  memoryDb.workerProfiles.set(id, req.body);

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO worker_profiles (id, user_id, name, city, state, expected_daily_wage, skills, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             expected_daily_wage = EXCLUDED.expected_daily_wage,
             skills = EXCLUDED.skills,
             updated_at = CURRENT_TIMESTAMP`,
        [id, user_id, name, city, state, expected_daily_wage, JSON.stringify(skills || [])]
      );
    } catch (err: any) {
      console.warn('Postgres worker write fallback:', err.message);
    }
  }

  broadcast('WORKER_UPDATED', req.body);
  res.json({ success: true, profile: req.body });
});

// 3. Employer Profile Sync
app.post('/api/employers/sync', async (req: Request, res: Response) => {
  const { id, user_id, business_name, business_type, contact_name, contact_phone, contact_email, city, state } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Employer id is required' });
  }

  memoryDb.employerProfiles.set(id, req.body);

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO employer_profiles (id, user_id, business_name, business_type, contact_name, contact_phone, contact_email, city, state, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET business_name = EXCLUDED.business_name,
             business_type = EXCLUDED.business_type,
             contact_name = EXCLUDED.contact_name,
             contact_phone = EXCLUDED.contact_phone,
             contact_email = EXCLUDED.contact_email,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             updated_at = CURRENT_TIMESTAMP`,
        [id, user_id, business_name, business_type, contact_name, contact_phone, contact_email, city, state]
      );
    } catch (err: any) {
      console.warn('Postgres employer write fallback:', err.message);
    }
  }

  broadcast('EMPLOYER_UPDATED', req.body);
  res.json({ success: true, profile: req.body });
});

// 4. Jobs Endpoints
app.get('/api/jobs', async (req: Request, res: Response) => {
  if (isDbConnected) {
    try {
      const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
      return res.json(result.rows);
    } catch {}
  }
  res.json(Array.from(memoryDb.jobs.values()));
});

app.post('/api/jobs', async (req: Request, res: Response) => {
  const job = req.body;
  memoryDb.jobs.set(job.id, job);

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO jobs (id, employer_id, title, description, skill_category, skill_name, city, state, start_date, start_time, end_time, workers_required, workers_hired, min_wage, max_wage, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             status = EXCLUDED.status,
             workers_hired = EXCLUDED.workers_hired`,
        [
          job.id,
          job.employer_id,
          job.title,
          job.description,
          job.skill_category,
          job.skill_name,
          job.city,
          job.state,
          job.start_date,
          job.start_time,
          job.end_time,
          job.workers_required,
          job.workers_hired,
          job.min_wage,
          job.max_wage,
          job.status,
        ]
      );
    } catch (err: any) {
      console.warn('Postgres job write fallback:', err.message);
    }
  }

  broadcast('JOB_DISPATCHED', job);
  res.json({ success: true, job });
});

// 5. Applications & Negotiations Endpoints
app.post('/api/applications', async (req: Request, res: Response) => {
  const application = req.body;
  memoryDb.applications.set(application.id, application);

  if (isDbConnected) {
    try {
      await pool.query(
        `INSERT INTO job_applications (id, job_id, worker_id, proposed_wage, status, note, negotiations)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE
         SET proposed_wage = EXCLUDED.proposed_wage,
             status = EXCLUDED.status,
             negotiations = EXCLUDED.negotiations,
             updated_at = CURRENT_TIMESTAMP`,
        [
          application.id,
          application.job_id,
          application.worker_id,
          application.proposed_wage,
          application.status,
          application.note,
          JSON.stringify(application.negotiations || []),
        ]
      );
    } catch (err: any) {
      console.warn('Postgres application write fallback:', err.message);
    }
  }

  broadcast('APPLICATION_RECEIVED', application);
  res.json({ success: true, application });
});

// Start Server
initDatabase().then(() => {
  server.listen(port, () => {
    console.log(`🚀 GigEasy PostgreSQL Realtime Server running at http://localhost:${port}`);
    console.log(`📡 WebSocket Realtime Gateway live at ws://localhost:${port}/realtime`);
  });
});
