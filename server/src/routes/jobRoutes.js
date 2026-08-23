const express = require('express');
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', jobController.searchJobs);
router.get('/nearby', jobController.getNearbyJobs);
router.get('/:id', jobController.getJob);

router.post(
  '/',
  [
    body('employer_id').notEmpty().withMessage('employer_id is required'),
    body('title').notEmpty().withMessage('title is required'),
    body('skill_required').notEmpty().withMessage('skill_required is required'),
    body('wage').isNumeric().withMessage('wage must be a positive number'),
    body('job_date').notEmpty().withMessage('job_date is required'),
    body('start_time').notEmpty().withMessage('start_time is required'),
    body('end_time').notEmpty().withMessage('end_time is required'),
    body('location').notEmpty().withMessage('location is required'),
    body('latitude').isNumeric().withMessage('latitude is required'),
    body('longitude').isNumeric().withMessage('longitude is required'),
    validate
  ],
  jobController.createJob
);

router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
