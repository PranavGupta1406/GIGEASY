const applicationRepository = require('../repositories/applicationRepository');
const jobRepository = require('../repositories/jobRepository');
const workerRepository = require('../repositories/workerRepository');

class ApplicationService {
  async applyJob({ job_id, worker_id }) {
    // Validate job and worker existence
    const job = await jobRepository.findById(job_id);
    if (!job) {
      const err = new Error(`Job with ID ${job_id} not found`);
      err.statusCode = 404;
      throw err;
    }
    const worker = await workerRepository.findById(worker_id);
    if (!worker) {
      const err = new Error(`Worker with ID ${worker_id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return await applicationRepository.apply({ job_id, worker_id });
  }

  async acceptApplication(id) {
    const app = await applicationRepository.findById(id);
    if (!app) {
      const err = new Error(`Application with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return await applicationRepository.updateStatus(id, 'ACCEPTED');
  }

  async rejectApplication(id) {
    const app = await applicationRepository.findById(id);
    if (!app) {
      const err = new Error(`Application with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return await applicationRepository.updateStatus(id, 'REJECTED');
  }

  async viewApplications(filters) {
    return await applicationRepository.findByJobOrWorker(filters);
  }
}

module.exports = new ApplicationService();
