const ratingService = require('../services/ratingService');

class RatingController {
  async addRating(req, res, next) {
    try {
      const rating = await ratingService.addRating(req.body);
      res.status(201).json({ success: true, data: rating });
    } catch (err) {
      next(err);
    }
  }

  async getRatings(req, res, next) {
    try {
      const ratings = await ratingService.getRatings(req.query);
      res.json({ success: true, data: ratings });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RatingController();
