const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Create a new job
router.post('/', jobController.createJob);

// Get all jobs
router.get('/', jobController.getAllJobs);

// Get jobs for a specific employer
router.get('/employer/:employerId', jobController.getJobsByEmployer);

module.exports = router;
