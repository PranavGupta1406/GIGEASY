const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Mock auth middleware for prototyping
const mockAuth = (req, res, next) => {
  req.user = { employerId: 1 };
  next();
};

router.use(mockAuth);

router.post('/checkout', orderController.checkout);
router.get('/active', orderController.getActiveOrders);
router.get('/history', orderController.getOrderHistory);

module.exports = router;
