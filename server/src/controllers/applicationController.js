const applicationService = require('../services/applicationService');

class ApplicationController {
  async applyJob(req, res, next) {
    try {
      const application = await applicationService.applyJob(req.body);
      res.status(201).json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  }

  async acceptApplication(req, res, next) {
    try {
      const application = await applicationService.acceptApplication(req.params.id);
      res.json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  }

  async rejectApplication(req, res, next) {
    try {
      const application = await applicationService.rejectApplication(req.params.id);
      res.json({ success: true, data: application });
    } catch (err) {
      next(err);
    }
  }

  async selectWorker(req, res, next) {
    try {
      const result = await applicationService.selectWorker(req.body);
      res.json({ success: true, message: 'Worker selected and booking confirmed successfully', data: result });
    } catch (err) {
      next(err);
    }
  }

  async viewApplications(req, res, next) {
    try {
      const applications = await applicationService.viewApplications(req.query);
      res.json({ success: true, data: applications });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ApplicationController();
