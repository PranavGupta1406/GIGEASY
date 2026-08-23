const express = require('express');
const { body } = require('express-validator');
const ratingController = require('../controllers/ratingController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', ratingController.getRatings);
router.post(
  '/',
  [
    body('job_id').notEmpty().withMessage('job_id is required'),
    body('worker_id').notEmpty().withMessage('worker_id is required'),
    body('employer_id').notEmpty().withMessage('employer_id is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5'),
    validate
  ],
  ratingController.addRating
);

module.exports = router;
