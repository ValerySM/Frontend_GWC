import axios from 'axios';

const API_BASE_URL = 'https://backend-gwc-1.onrender.com';

const UniverseData = {
  telegramId: '5859381541', // Фиксированный telegram_id для теста
  totalClicks: null,
  isDataLoaded: false,

  async initFromServer() {
    console.log('Initializing from server for Telegram ID:', this.telegramId);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user?telegram_id=${this.telegramId}`);
      console.log('Server response:', response.data);

      if (response.data.success) {
        this.setTotalClicks(response.data.totalClicks);
        this.isDataLoaded = true;
        console.log('Data set in UniverseData. Total clicks:', this.totalClicks);
        return true;
      } else {
        throw new Error(response.data.error || 'Unknown error loading data');
      }
    } catch (error) {
      console.error('Error initializing data from server:', error.response ? error.response.data : error.message);
      return false;
    }
  },

  getUserData() {
    console.log('Getting user data. Telegram ID:', this.telegramId);
    return { telegramId: this.telegramId };
  },

  getTotalClicks() {
    if (!this.isDataLoaded) {
      console.warn('Attempting to get totalClicks before data is loaded');
      return 0;
    }
    console.log('Getting total clicks:', this.totalClicks);
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    console.log('Setting total clicks:', clicks);
    this.totalClicks = clicks;
    this.notifyListeners();
  },

  incrementTotalClicks() {
    if (!this.isDataLoaded) {
      console.warn('Attempting to increment totalClicks before data is loaded');
      return 0;
    }
    this.totalClicks += 1;
    console.log('Incremented total clicks:', this.totalClicks);
    this.notifyListeners();
    return this.totalClicks;
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
    if (!this.isDataLoaded) {
      console.warn('Attempting to save data before it is loaded');
      return;
    }
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