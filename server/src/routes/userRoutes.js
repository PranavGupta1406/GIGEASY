const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post(
  '/',
  [
    body('firebase_uid').notEmpty().withMessage('firebase_uid is required'),
    body('role').isIn(['worker', 'employer', 'admin']).withMessage('Role must be worker, employer, or admin'),
    body('phone').notEmpty().withMessage('phone is required'),
    validate
  ],
  userController.createUser
);

router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
