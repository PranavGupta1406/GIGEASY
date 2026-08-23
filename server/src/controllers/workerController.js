const workerService = require('../services/workerService');

class WorkerController {
  async createProfile(req, res, next) {
    try {
      const worker = await workerService.createProfile(req.body);
      res.status(201).json({ success: true, data: worker });
    } catch (err) {
      next(err);
    }
  }

  async getWorker(req, res, next) {
    try {
      const worker = await workerService.getWorkerById(req.params.id);
      res.json({ success: true, data: worker });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const worker = await workerService.updateProfile(req.params.id, req.body);
      res.json({ success: true, data: worker });
    } catch (err) {
      next(err);
    }
  }

  async searchWorkers(req, res, next) {
    try {
      const workers = await workerService.searchWorkers(req.query);
      res.json({ success: true, data: workers });
    } catch (err) {
      next(err);
    }
  }

  async getTopRated(req, res, next) {
    try {
      const topWorkers = await workerService.getTopRated();
      res.json({ success: true, data: topWorkers });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await workerService.getWorkerHistory(req.params.id);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkerController();
