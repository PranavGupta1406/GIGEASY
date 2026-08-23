const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
