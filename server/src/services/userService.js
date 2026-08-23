const userRepository = require('../repositories/userRepository');

class UserService {
  async createUser(userData) {
    return await userRepository.create(userData);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error(`User with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async updateUser(id, updateData) {
    await this.getUserById(id);
    return await userRepository.update(id, updateData);
  }
}

module.exports = new UserService();
