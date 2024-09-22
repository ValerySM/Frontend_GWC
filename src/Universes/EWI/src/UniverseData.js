const BACKEND_URL = 'https://backend-gwc.onrender.com';

const UniverseData = {
  userId: null,
  
  async initializeUser(userId) {
    this.userId = userId;
    const response = await fetch(`${BACKEND_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) throw new Error('Failed to initialize user');
    return response.json();
  },

  async getUserData() {
    if (!this.userId) throw new Error('User not initialized');
    const response = await fetch(`${BACKEND_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: this.userId }),
    });
    if (!response.ok) throw new Error('Failed to get user data');
    return response.json();
  },

  async updateUserData(updates) {
    if (!this.userId) throw new Error('User not initialized');
    const response = await fetch(`${BACKEND_URL}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: this.userId, updates }),
    });
    if (!response.ok) throw new Error('Failed to update user data');
    return response.json();
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