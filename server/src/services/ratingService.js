const ratingRepository = require('../repositories/ratingRepository');

class RatingService {
  async addRating(data) {
    if (data.rating < 1 || data.rating > 5) {
      const err = new Error('Rating must be between 1 and 5');
      err.statusCode = 400;
      throw err;
    }
    return await ratingRepository.add(data);
  }

  async getRatings(filters) {
    return await ratingRepository.findByWorkerOrJob(filters);
  }
}

module.exports = new RatingService();
