const bookingRepository = require('../repositories/bookingRepository');

class BookingService {
  async createBooking(data) {
    return await bookingRepository.create(data);
  }

  async getBookingById(id) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const err = new Error(`Booking with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }
    return booking;
  }

  async completeBooking(id) {
    await this.getBookingById(id);
    return await bookingRepository.updateStatus(id, 'COMPLETED');
  }
}

module.exports = new BookingService();
