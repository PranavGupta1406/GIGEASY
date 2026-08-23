const db = require('../config/db');

// Dummy data fallback
const DUMMY_CATEGORIES = [
  { category_id: 1, name: 'Construction & Infrastructure', description: 'Masons, Carpenters, Painters, Electricians' },
  { category_id: 2, name: 'Factory & Industrial Workers', description: 'Assembly workers, Machine operators' },
  { category_id: 3, name: 'Transportation & Delivery', description: 'Drivers, Loaders, Delivery personnel' },
  { category_id: 4, name: 'Retail & Logistics', description: 'Warehouse staff, Store helpers' },
  { category_id: 5, name: 'Event & Hospitality', description: 'Waiters, Event setup, Cleaners' }
];

const DUMMY_SERVICES = [
  { service_id: 1, category_id: 1, name: 'Electrician', base_price: 700, category_name: 'Construction & Infrastructure' },
  { service_id: 2, category_id: 1, name: 'Plumber', base_price: 650, category_name: 'Construction & Infrastructure' },
  { service_id: 3, category_id: 1, name: 'Mason', base_price: 800, category_name: 'Construction & Infrastructure' },
  { service_id: 4, category_id: 2, name: 'Assembly Worker', base_price: 500, category_name: 'Factory & Industrial Workers' },
  { service_id: 5, category_id: 3, name: 'Delivery Driver', base_price: 900, category_name: 'Transportation & Delivery' },
  { service_id: 6, category_id: 5, name: 'Event Setup', base_price: 600, category_name: 'Event & Hospitality' },
  { service_id: 7, category_id: 4, name: 'Warehouse Helper', base_price: 550, category_name: 'Retail & Logistics' }
];

class ServiceRepository {
  async getAllCategories() {
    try {
      const res = await db.query('SELECT * FROM service_categories ORDER BY category_id ASC');
      if (res.rows.length === 0) return DUMMY_CATEGORIES;
      return res.rows;
    } catch (e) {
      console.warn('DB error in getAllCategories, returning dummy data');
      return DUMMY_CATEGORIES;
    }
  }

  async getServicesByCategory(categoryId) {
    try {
      const res = await db.query(
        `SELECT s.*, c.name as category_name 
         FROM services s 
         JOIN service_categories c ON s.category_id = c.category_id 
         WHERE s.category_id = $1`,
        [categoryId]
      );
      if (res.rows.length === 0) return DUMMY_SERVICES.filter(s => s.category_id == categoryId);
      return res.rows;
    } catch (e) {
      console.warn('DB error in getServicesByCategory, returning dummy data');
      return DUMMY_SERVICES.filter(s => s.category_id == categoryId);
    }
  }

  async getAllServices() {
    try {
      const res = await db.query(
        `SELECT s.*, c.name as category_name 
         FROM services s 
         JOIN service_categories c ON s.category_id = c.category_id`
      );
      if (res.rows.length === 0) return DUMMY_SERVICES;
      return res.rows;
    } catch (e) {
      console.warn('DB error in getAllServices, returning dummy data');
      return DUMMY_SERVICES;
    }
  }

  async getServiceById(serviceId) {
    try {
      const res = await db.query('SELECT * FROM services WHERE service_id = $1', [serviceId]);
      if (res.rows.length === 0) return DUMMY_SERVICES.find(s => s.service_id == serviceId);
      return res.rows[0];
    } catch (e) {
      console.warn('DB error in getServiceById, returning dummy data');
      return DUMMY_SERVICES.find(s => s.service_id == serviceId);
    }
  }
}

module.exports = new ServiceRepository();
