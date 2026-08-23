const express = require('express');
const { body } = require('express-validator');
const employerController = require('../controllers/employerController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/:id', employerController.getEmployer);
router.get('/:id/history', employerController.getHistory);

router.post(
  '/',
  [
    body('user_id').notEmpty().withMessage('user_id is required'),
    body('company_name').notEmpty().withMessage('company_name is required'),
    body('company_type').notEmpty().withMessage('company_type is required'),
    body('address').notEmpty().withMessage('address is required'),
    validate
  ],
  employerController.createEmployer
);

router.put('/:id', employerController.updateEmployer);

module.exports = router;
