const express = require('express');
const userRoutes = require('./userRoutes');
const workerRoutes = require('./workerRoutes');
const employerRoutes = require('./employerRoutes');
const serviceRoutes = require('./serviceRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const bookingRoutes = require('./bookingRoutes');
const earningRoutes = require('./earningRoutes');
const ratingRoutes = require('./ratingRoutes');
const jobRoutes = require('./jobRoutes');
// const kycRoutes = require('./kycRoutes');
// const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/workers', workerRoutes);
router.use('/employers', employerRoutes);
router.use('/services', serviceRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/bookings', bookingRoutes);
router.use('/earnings', earningRoutes);
router.use('/ratings', ratingRoutes);
router.use('/jobs', jobRoutes);
// router.use('/kyc', kycRoutes);
// router.use('/analytics', analyticsRoutes);

module.exports = router;
