const skillService = require('../services/skillService');

class SkillController {
  async getSkills(req, res, next) {
    try {
      const skills = await skillService.getSkills();
      res.json({ success: true, data: skills });
    } catch (err) {
      next(err);
    }
  }

  async addSkill(req, res, next) {
    try {
      const skill = await skillService.addSkill(req.body.skill_name);
      res.status(201).json({ success: true, data: skill });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SkillController();
