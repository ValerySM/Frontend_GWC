import axios from 'axios';

const API_BASE_URL = 'https://backend-gwc-1.onrender.com';

const UniverseData = {
  telegramId: '5859381541', // Фиксированный telegram_id для теста
  totalClicks: 50, // Начальное значение totalClicks для теста

  async initFromServer() {
    console.log('Initializing with fixed data');
    console.log('Fixed telegram_id:', this.telegramId);
    console.log('Initial totalClicks:', this.totalClicks);
    return true;
  },

  setUserData(id) {
    console.log('Setting user data:', id);
    // Для теста мы не будем менять telegramId
  },

  getUserData() {
    console.log('Getting user data. telegramId:', this.telegramId);
    return { telegramId: this.telegramId };
  },

  getTotalClicks() {
    console.log('Getting total clicks:', this.totalClicks);
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    console.log('Setting total clicks:', clicks);
    this.totalClicks = clicks;
    this.notifyListeners();
  },

  listeners: [],

  addListener(callback) {
    this.listeners.push(callback);
  },

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  },

  notifyListeners() {
    console.log('Notifying listeners. Current clicks:', this.totalClicks);
    this.listeners.forEach(listener => listener(this.totalClicks));
  },

  async saveToServer() {
    const dataToSend = {
      telegram_id: this.telegramId,
      totalClicks: this.totalClicks
    };

    console.log('Sending data to server:', dataToSend);

    try {
      const response = await axios.put(`${API_BASE_URL}/api/users`, dataToSend);
      if (response.data.success) {
        console.log('Data successfully saved on server');
      } else {
        console.log('Failed to save data on server:', response.data.error);
      }
      return response.data;
    } catch (error) {
      console.log('Error saving data on server:', error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

export default UniverseData;