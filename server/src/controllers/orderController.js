const orderService = require('../services/orderService');

exports.checkout = async (req, res, next) => {
  try {
    const { employerId } = req.user;
    const order = await orderService.checkout(employerId, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.getActiveOrders = async (req, res, next) => {
  try {
    const { employerId } = req.user;
    const orders = await orderService.getActiveOrders(employerId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const { employerId } = req.user;
    const orders = await orderService.getOrderHistory(employerId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
