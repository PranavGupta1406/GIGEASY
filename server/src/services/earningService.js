const earningRepository = require('../repositories/earningRepository');

class EarningService {
  async getSummary(worker_id) {
    return await earningRepository.getSummary(worker_id);
  }

  async getDaily(worker_id) {
    return await earningRepository.getDaily(worker_id);
  }

  async getMonthly(worker_id) {
    return await earningRepository.getMonthly(worker_id);
  }

  async recordEarning(data) {
    return await earningRepository.create(data);
  }
}

module.exports = new EarningService();
