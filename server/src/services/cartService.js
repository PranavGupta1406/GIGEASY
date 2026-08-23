const cartRepository = require('../repositories/cartRepository');

class CartService {
  async getCart(employerId) {
    return await cartRepository.getCart(employerId);
  }

  async addItem(employerId, itemData) {
    if (!itemData.service_id || !itemData.date || !itemData.shift_time) {
      throw new Error('Missing required fields for cart item');
    }
    return await cartRepository.addItem(employerId, itemData);
  }

  async updateItem(employerId, cartItemId, updates) {
    // Add security check if needed
    return await cartRepository.updateItem(cartItemId, updates);
  }

  async removeItem(employerId, cartItemId) {
    return await cartRepository.removeItem(cartItemId);
  }

  async clearCart(employerId) {
    return await cartRepository.clearCart(employerId);
  }
}

module.exports = new CartService();
