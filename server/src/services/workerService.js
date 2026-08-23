const workerRepository = require('../repositories/workerRepository');

class WorkerService {
  async createProfile(data) {
    return await workerRepository.create(data);
  }

  async getWorkerById(id) {
    const worker = await workerRepository.findById(id);
    if (!worker) {
      const err = new Error(`Worker profile with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return worker;
  }

  async updateProfile(id, data) {
    await this.getWorkerById(id);
    return await workerRepository.update(id, data);
  }

  async searchWorkers(filters) {
    return await workerRepository.search(filters);
  }

  async getTopRated() {
    return await workerRepository.findTopRated();
  }

  async getWorkerHistory(id) {
    return await workerRepository.getHistory(id);
  }
}

module.exports = new WorkerService();
