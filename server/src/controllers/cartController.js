const cartService = require('../services/cartService');

exports.getCart = async (req, res, next) => {
  try {
    const { employerId } = req.user; 
    const cart = await cartService.getCart(employerId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const { employerId } = req.user;
    const item = await cartService.addItem(employerId, req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { employerId } = req.user;
    const { id } = req.params;
    const updated = await cartService.updateItem(employerId, id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { employerId } = req.user;
    const { id } = req.params;
    await cartService.removeItem(employerId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
