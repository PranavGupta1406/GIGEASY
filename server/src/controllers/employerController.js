const employerService = require('../services/employerService');

class EmployerController {
  async createEmployer(req, res, next) {
    try {
      const employer = await employerService.createProfile(req.body);
      res.status(201).json({ success: true, data: employer });
    } catch (err) {
      next(err);
    }
  }

  async getEmployer(req, res, next) {
    try {
      const employer = await employerService.getEmployerById(req.params.id);
      res.json({ success: true, data: employer });
    } catch (err) {
      next(err);
    }
  }

  async updateEmployer(req, res, next) {
    try {
      const employer = await employerService.updateProfile(req.params.id, req.body);
      res.json({ success: true, data: employer });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await employerService.getEmployerHistory(req.params.id);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EmployerController();
