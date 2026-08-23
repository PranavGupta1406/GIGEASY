const express = require('express');
const { body } = require('express-validator');
const workerController = require('../controllers/workerController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', workerController.searchWorkers);
router.get('/top-rated', workerController.getTopRated);
router.get('/:id', workerController.getWorker);
router.get('/:id/history', workerController.getHistory);

router.post(
  '/',
  [
    body('user_id').notEmpty().withMessage('user_id is required'),
    body('full_name').notEmpty().withMessage('full_name is required'),
    body('location').notEmpty().withMessage('location is required'),
    body('latitude').isNumeric().withMessage('latitude must be a valid number'),
    body('longitude').isNumeric().withMessage('longitude must be a valid number'),
    validate
  ],
  workerController.createProfile
);

router.put('/:id', workerController.updateProfile);

module.exports = router;
