const express = require('express');
const { body } = require('express-validator');
const earningController = require('../controllers/earningController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/summary/:worker_id', earningController.getSummary);
router.get('/daily/:worker_id', earningController.getDaily);
router.get('/monthly/:worker_id', earningController.getMonthly);
router.get('/report/:worker_id', earningController.getMonthly); // Alias for report

router.post(
  '/',
  [
    body('worker_id').notEmpty().withMessage('worker_id is required'),
    body('job_id').notEmpty().withMessage('job_id is required'),
    body('amount').isNumeric().withMessage('amount is required'),
    validate
  ],
  earningController.recordEarning
);

module.exports = router;
