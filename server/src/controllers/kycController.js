const kycService = require('../services/kycService');

class KYCController {
  async getStatus(req, res, next) {
    try {
      const status = await kycService.getStatus(req.params.user_id);
      res.json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const status = await kycService.updateStatus(req.params.user_id, req.body);
      res.json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new KYCController();
