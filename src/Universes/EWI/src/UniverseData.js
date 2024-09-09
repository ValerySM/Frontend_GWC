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
    console.log(`Initializing from server for user: ${username} (ID: ${telegramId})`);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth`, {
        telegram_id: telegramId,
        username: username
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        this.token = response.data.token;
        localStorage.setItem('token', this.token);
        this.setUserData(response.data.user_data.telegram_id, response.data.user_data.username);
        this.setTotalClicks(response.data.user_data.totalClicks);
        this.setCurrentUniverse(response.data.user_data.currentUniverse);
        console.log('User data set successfully');
        return true;
      } else {
        console.error('Server returned success: false');
        return false;
      }
    } catch (error) {
      console.error('Error during initFromServer:', error);
      return false;
    }
  },

  setUserData(id, name) {
    console.log(`Setting user data: ID=${id}, Name=${name}`);
    this.telegramId = id;
    this.username = name;
  },

  getUserData() {
    return { telegramId: this.telegramId, username: this.username };
  },

  setTotalClicks(clicks) {
    console.log(`Setting total clicks: ${clicks}`);
    this.totalClicks = clicks;
    this.saveToServer();
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setCurrentUniverse(universeName) {
    console.log(`Setting current universe: ${universeName}`);
    this.currentUniverse = universeName;
    this.saveToServer();
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  async saveToServer() {
    console.log('Saving data to server...');
    try {
      const response = await axios.put(`${API_BASE_URL}/api/user`, {
        totalClicks: this.totalClicks,
        currentUniverse: this.currentUniverse,
        universes: this.universes
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Server response to save:', response.data);
    } catch (error) {
      console.error('Error saving data to server:', error);
    }
  },

  async logToServer(message) {
    console.log(`Logging to server: ${message}`);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/log`, { message }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('Log sent to server:', response.data);
    } catch (error) {
      console.error('Error sending log to server:', error);
    }
  }
};

export default UniverseData;