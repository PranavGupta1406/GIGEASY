const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', applicationController.viewApplications);
router.post(
  '/',
  [
    body('job_id').notEmpty().withMessage('job_id is required'),
    body('worker_id').notEmpty().withMessage('worker_id is required'),
    validate
  ],
  applicationController.applyJob
);

router.post(
  '/select-worker',
  [
    body('job_id').notEmpty().withMessage('job_id is required'),
    body('worker_id').notEmpty().withMessage('worker_id is required'),
    body('employer_id').notEmpty().withMessage('employer_id is required'),
    validate
  ],
  applicationController.selectWorker
);

router.put('/:id/accept', applicationController.acceptApplication);
router.put('/:id/reject', applicationController.rejectApplication);

module.exports = router;
