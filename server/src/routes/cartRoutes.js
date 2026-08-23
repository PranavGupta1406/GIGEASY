const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// For now mock auth middleware inline for prototyping if needed
const mockAuth = (req, res, next) => {
  req.user = { employerId: 1 }; // Default employer from seeds
  next();
};

router.use(mockAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:id', cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);

module.exports = router;
