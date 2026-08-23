const kycRepository = require('../repositories/kycRepository');

class KYCService {
  async getStatus(user_id) {
    const status = await kycRepository.getStatus(user_id);
    if (!status) {
      return {
        user_id: parseInt(user_id, 10),
        aadhaar_verified: false,
        face_verified: false,
        digilocker_verified: false,
        verified_at: null
      };
    }
    return status;
  }

  async updateStatus(user_id, updates) {
    return await kycRepository.updateStatus(user_id, updates);
  }
}

module.exports = new KYCService();
