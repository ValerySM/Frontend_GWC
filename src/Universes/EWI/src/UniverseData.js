import { authenticateUser, updateUserData, logToServer } from './services/apiService';

const UniverseData = {
  telegramId: null,
  username: null,
  totalClicks: 0,
  gameScores: {
    appleCatcher: 0,
    purblePairs: 0
  },
  universes: {},
  currentUniverse: 'default',
  isLoading: true,
  
  eweData: {
    tokens: 0,
    farmedTokens: 0,
    isFarming: false,
    startTime: null,
    elapsedFarmingTime: 0
  },

  async initFromServer(telegramId, username) {
    this.isLoading = true;
    console.log('initFromServer вызван с параметрами:', telegramId, username);
    try {
      const data = await authenticateUser(telegramId, username);
      if (data.success) {
        this.setUserData(data.telegram_id, data.username);
        this.setTotalClicks(data.totalClicks);
        this.setCurrentUniverse(data.currentUniverse);
        this.universes = data.universes || {};
        this.gameScores = data.gameScores || { appleCatcher: 0, purblePairs: 0 };
        this.eweData = data.eweData || {
          tokens: 0,
          farmedTokens: 0,
          isFarming: false,
          startTime: null,
          elapsedFarmingTime: 0
        };
        console.log('Данные установлены в UniverseData:', JSON.stringify(this));
        await this.logToServer('Данные успешно загружены с сервера');
        this.isLoading = false;
        return true;
      }
      throw new Error(data.error || 'Неизвестная ошибка при загрузке данных');
    } catch (error) {
      console.error('Ошибка при инициализации данных с сервера:', error);
      await this.logToServer(`Ошибка при инициализации данных с сервера: ${error.message}`);
      this.isLoading = false;
      return false;
    }
  },

  setUserData(id, name) {
    console.log('setUserData вызван с:', id, name);
    this.telegramId = id;
    this.username = name;
    this.logToServer('Данные пользователя установлены');
  },

  getUserData() {
    console.log('getUserData вызван. telegramId:', this.telegramId, 'username:', this.username);
    return { telegramId: this.telegramId, username: this.username };
  },

  clearUserData() {
    this.telegramId = null;
    this.username = null;
    this.totalClicks = 0;
    this.universes = {};
    this.currentUniverse = 'default';
    this.logToServer('Данные пользователя очищены');
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    console.log('setTotalClicks вызван с:', clicks);
    this.totalClicks = clicks;
    this.notifyListeners();
    this.logToServer(`Установлено общее количество кликов: ${clicks}`);
  },

  listeners: [],

  addListener(callback) {
    this.listeners.push(callback);
  },

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  },

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.totalClicks));
  },

  addGameScore(gameType, score) {
    if (gameType in this.gameScores) {
      this.gameScores[gameType] = score;
      this.totalClicks += score;
      this.saveToServer();
      this.notifyListeners();
      this.logToServer(`Обновлен счет ${gameType}: ${this.gameScores[gameType]}, Новое общее количество кликов: ${this.totalClicks}`);
    } else {
      this.logToServer(`Неизвестный тип игры: ${gameType}`);
    }
  },

  setUniverseData(universeName, data) {
    if (!this.universes[universeName]) {
      this.universes[universeName] = {};
    }
    Object.assign(this.universes[universeName], data);
    this.saveToServer();
    this.logToServer(`Установлены данные вселенной: ${universeName}`);
  },

  getUniverseData(universeName, key, defaultValue) {
    if (!this.universes[universeName]) {
      this.universes[universeName] = {};
    }
    if (this.universes[universeName][key] === undefined) {
      return defaultValue;
    }
    return this.universes[universeName][key];
  },

  setCurrentUniverse(universeName) {
    console.log('setCurrentUniverse вызван с:', universeName);
    this.currentUniverse = universeName;
    this.saveToServer();
    this.logToServer(`Текущая вселенная установлена на: ${universeName}`);
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  setEWEData(key, value) {
    this.eweData[key] = value;
    this.saveToServer();
    this.logToServer(`Установлены данные EWE: ${key} = ${value}`);
  },

  getEWEData(key) {
    return this.eweData[key];
  },

  async logToServer(message) {
    try {
      await logToServer(message, this.telegramId, this.username);
    } catch (error) {
      console.error('Ошибка при отправке лога на сервер:', error);
    }
  },

  isDataLoaded() {
    return !this.isLoading && this.telegramId !== null && this.username !== null;
  },

  async saveToServer() {
    if (!this.isDataLoaded()) {
      console.warn('Попытка сохранения данных до их полной загрузки');
      return;
    }

    const { telegramId, username } = this.getUserData();
    await this.logToServer(`Попытка сохранения данных для пользователя: ${telegramId}, ${username}`);
    if (!telegramId) {
      await this.logToServer('Telegram ID недоступен');
      return;
    }

    const dataToSend = {
      telegram_id: telegramId,
      username: username,
      totalClicks: this.totalClicks,
      currentUniverse: this.currentUniverse,
      universes: this.universes,
      gameScores: this.gameScores,
      eweData: this.eweData
    };

    try {
      await updateUserData(dataToSend);
      await this.logToServer('Данные успешно сохранены на сервере');
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({action: 'save_success'}));
      }
    } catch (error) {
      await this.logToServer(`Ошибка сохранения данных на сервере: ${error.message}`);
    }
  },
};

export default UniverseData;