const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', analyticsController.getDashboard);

module.exports = router;
