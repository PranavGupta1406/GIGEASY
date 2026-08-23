const express = require('express');
const { body } = require('express-validator');
const skillController = require('../controllers/skillController');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', skillController.getSkills);
router.post(
  '/',
  [
    body('skill_name').notEmpty().withMessage('skill_name is required'),
    validate
  ],
  skillController.addSkill
);

module.exports = router;
