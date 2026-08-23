const express = require('express');
const kycController = require('../controllers/kycController');

const router = express.Router();

router.get('/:user_id', kycController.getStatus);
router.put('/:user_id', kycController.updateStatus);

module.exports = router;
