const express = require('express');
const userRoutes = require('./userRoutes');
const workerRoutes = require('./workerRoutes');
const employerRoutes = require('./employerRoutes');
const skillRoutes = require('./skillRoutes');
const jobRoutes = require('./jobRoutes');
const applicationRoutes = require('./applicationRoutes');
const bookingRoutes = require('./bookingRoutes');
const earningRoutes = require('./earningRoutes');
const ratingRoutes = require('./ratingRoutes');
const kycRoutes = require('./kycRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/workers', workerRoutes);
router.use('/employers', employerRoutes);
router.use('/skills', skillRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/earnings', earningRoutes);
router.use('/ratings', ratingRoutes);
router.use('/kyc', kycRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
