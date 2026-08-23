const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBooking);
router.post(
  '/',
  [
    body('job_id').notEmpty().withMessage('job_id is required'),
    body('worker_id').notEmpty().withMessage('worker_id is required'),
    body('employer_id').notEmpty().withMessage('employer_id is required'),
    validate
  ],
  bookingController.createBooking
);

router.put('/:id/complete', bookingController.completeBooking);

module.exports = router;
