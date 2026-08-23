const serviceRepository = require('../repositories/serviceRepository');

class ServiceService {
  async getAllCategories() {
    return await serviceRepository.getAllCategories();
  }

  async getServices(categoryId) {
    if (categoryId) {
      return await serviceRepository.getServicesByCategory(categoryId);
    }
    return await serviceRepository.getAllServices();
  }
}

module.exports = new ServiceService();
