const BACKEND_URL = 'https://backend-gwc.onrender.com';

const UniverseData = {
  userData: null,

  setUserData(data) {
    this.userData = data;
  },

  async getUserData() {
    if (!this.userData) {
      throw new Error('User data not initialized');
    }
    return this.userData;
  },

  async updateUserData(updates) {
    if (!this.userData || !this.userData.telegram_id) {
      throw new Error('User not initialized');
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.userData.telegram_id,
          updates: updates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const updatedData = await response.json();
      this.userData = updatedData;
      return updatedData;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },

  async incrementTotalClicks(amount) {
    return this.updateUserData({ totalClicks: { $inc: amount } });
  },

  async setEnergy(newEnergy) {
    return this.updateUserData({ energy: newEnergy });
  },

  async upgradeAttribute(attribute, cost) {
    return this.updateUserData({
      [`${attribute}Level`]: { $inc: 1 },
      totalClicks: { $inc: -cost },
    });
  },
};

export default UniverseData;