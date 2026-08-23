const serviceService = require('../services/serviceService');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await serviceService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const { category_id } = req.query;
    const services = await serviceService.getServices(category_id);
    res.json(services);
  } catch (error) {
    next(error);
  }
};
