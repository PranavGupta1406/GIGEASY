const orderRepository = require('../repositories/orderRepository');

class OrderService {
  async checkout(employerId, checkoutData) {
    if (!checkoutData.work_site_address || !checkoutData.latitude || !checkoutData.longitude) {
      throw new Error('Location data is required for checkout');
    }
    return await orderRepository.checkoutCart(employerId, checkoutData);
  }

  async getActiveOrders(employerId) {
    return await orderRepository.getActiveOrders(employerId);
  }

  async getOrderHistory(employerId) {
    return await orderRepository.getOrderHistory(employerId);
  }
}

module.exports = new OrderService();
