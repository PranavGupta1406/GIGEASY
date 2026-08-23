const employerRepository = require('../repositories/employerRepository');

class EmployerService {
  async createProfile(data) {
    return await employerRepository.create(data);
  }

  async getEmployerById(id) {
    const employer = await employerRepository.findById(id);
    if (!employer) {
      const err = new Error(`Employer profile with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return employer;
  }

  async updateProfile(id, data) {
    await this.getEmployerById(id);
    return await employerRepository.update(id, data);
  }

  async getEmployerHistory(id) {
    return await employerRepository.getHistory(id);
  }
}

module.exports = new EmployerService();
