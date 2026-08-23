const earningService = require('../services/earningService');

class EarningController {
  async getSummary(req, res, next) {
    try {
      const summary = await earningService.getSummary(req.params.worker_id);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  async getDaily(req, res, next) {
    try {
      const daily = await earningService.getDaily(req.params.worker_id);
      res.json({ success: true, data: daily });
    } catch (err) {
      next(err);
    }
  }

  async getMonthly(req, res, next) {
    try {
      const monthly = await earningService.getMonthly(req.params.worker_id);
      res.json({ success: true, data: monthly });
    } catch (err) {
      next(err);
    }
  }

  async recordEarning(req, res, next) {
    try {
      const earning = await earningService.recordEarning(req.body);
      res.status(201).json({ success: true, data: earning });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EarningController();
