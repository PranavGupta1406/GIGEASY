const skillRepository = require('../repositories/skillRepository');

class SkillService {
  async getSkills() {
    return await skillRepository.getAll();
  }

  async addSkill(name) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      const err = new Error('Skill name is required');
      err.statusCode = 400;
      throw err;
    }
    return await skillRepository.add(name.trim());
  }
}

module.exports = new SkillService();
