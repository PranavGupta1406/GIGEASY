const jobRepository = require('../repositories/jobRepository');

class JobService {
  async createJob(jobData) {
    return await jobRepository.create(jobData);
  }

  async getJobById(id) {
    const job = await jobRepository.findById(id);
    if (!job) {
      const err = new Error(`Job with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return job;
  }

  async updateJob(id, updates) {
    await this.getJobById(id);
    return await jobRepository.update(id, updates);
  }

  async deleteJob(id) {
    await this.getJobById(id);
    return await jobRepository.delete(id);
  }

  async searchJobs(filters) {
    return await jobRepository.search(filters);
  }

  async getNearbyJobs(lat, lng, radius_km) {
    if (!lat || !lng) {
      const err = new Error('Latitude and Longitude query parameters are required for nearby job search');
      err.statusCode = 400;
      throw err;
    }
    return await jobRepository.findNearby(lat, lng, radius_km);
  }
}

module.exports = new JobService();
