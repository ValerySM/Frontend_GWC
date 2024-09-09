import axios from 'axios';

const API_BASE_URL = 'https://backend-gwc-1.onrender.com';

const UniverseData = {
  telegramId: '',
  username: '',
  totalClicks: 0,
  gameScores: {
    appleCatcher: 0,
    purblePairs: 0
  },
  universes: {},
  currentUniverse: 'default',
  token: '',
  
  async initFromServer(telegramId, username) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth`, {
        telegram_id: telegramId,
        username: username
      });

      if (response.data.success) {
        this.token = response.data.token;
        localStorage.setItem('token', this.token);
        await this.fetchUserData();
        return true;
      } else {
        throw new Error(response.data.error || 'Unknown error during authentication');
      }
    } catch (error) {
      console.error('Error during initFromServer:', error);
      return false;
    }
  },

  async fetchUserData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.data.success) {
        this.setUserData(response.data.telegram_id, response.data.username);
        this.setTotalClicks(response.data.totalClicks);
        this.setCurrentUniverse(response.data.currentUniverse);
        this.universes = response.data.universes;
        console.log('User data fetched successfully:', this);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },

  setUserData(id, name) {
    this.telegramId = id;
    this.username = name;
  },

  getUserData() {
    return { telegramId: this.telegramId, username: this.username };
  },

  setTotalClicks(clicks) {
    this.totalClicks = clicks;
    this.saveToServer();
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setCurrentUniverse(universeName) {
    this.currentUniverse = universeName;
    this.saveToServer();
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  async saveToServer() {
    try {
      await axios.put(`${API_BASE_URL}/api/user`, {
        totalClicks: this.totalClicks,
        currentUniverse: this.currentUniverse,
        universes: this.universes
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Data saved to server successfully');
    } catch (error) {
      console.error('Error saving data to server:', error);
    }
  },

  async logToServer(message) {
    try {
      await axios.post(`${API_BASE_URL}/api/log`, { message }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Log sent to server successfully');
    } catch (error) {
      console.error('Error sending log to server:', error);
    }
  }
};

export default UniverseData;