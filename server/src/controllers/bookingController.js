const bookingService = require('../services/bookingService');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBooking(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  async getBooking(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id);
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  async completeBooking(req, res, next) {
    try {
      const booking = await bookingService.completeBooking(req.params.id);
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
