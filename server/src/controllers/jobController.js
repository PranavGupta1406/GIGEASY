const jobService = require('../services/jobService');

class JobController {
  async createJob(req, res, next) {
    try {
      const job = await jobService.createJob(req.body);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  async getJob(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  async updateJob(req, res, next) {
    try {
      const job = await jobService.updateJob(req.params.id, req.body);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const result = await jobService.deleteJob(req.params.id);
      res.json({ success: true, message: 'Job deleted successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  async searchJobs(req, res, next) {
    try {
      const jobs = await jobService.searchJobs(req.query);
      res.json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  async getNearbyJobs(req, res, next) {
    try {
      const { latitude, longitude, radius } = req.query;
      const jobs = await jobService.getNearbyJobs(latitude, longitude, radius);
      res.json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobController();
