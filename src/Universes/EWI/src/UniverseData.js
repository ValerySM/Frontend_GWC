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
  
  eweData: {
    tokens: 0,
    farmedTokens: 0,
    isFarming: false,
    startTime: null,
    elapsedFarmingTime: 0
  },

  setUserData(id, name) {
    this.telegramId = id;
    this.username = name;
    localStorage.setItem('telegramId', id);
    localStorage.setItem('username', name);
  },

  getUserData() {
    if (!this.telegramId) {
      this.telegramId = localStorage.getItem('telegramId');
      this.username = localStorage.getItem('username');
    }
    return { telegramId: this.telegramId, username: this.username };
  },

  clearUserData() {
    this.telegramId = null;
    this.username = null;
    localStorage.removeItem('telegramId');
    localStorage.removeItem('username');
  },

  getTotalClicks() {
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
    this.listeners.forEach(listener => listener(this.totalClicks));
  },

  setTotalClicks(newTotal) {
    this.totalClicks = newTotal;
    this.saveToServer();
    this.notifyListeners();
  },

  addGameScore(gameType, score) {
    if (gameType in this.gameScores) {
      this.gameScores[gameType] = score;
      this.totalClicks += score;
      this.saveToServer();
      this.notifyListeners();
      console.log(`Updated ${gameType} score:`, this.gameScores[gameType]);
      console.log('New total clicks:', this.totalClicks);
    } else {
      console.error('Неизвестный тип игры:', gameType);
    }
  },

  setUniverseData(universeName, key, value) {
    if (!this.universes[universeName]) {
      this.universes[universeName] = {};
    }
    this.universes[universeName][key] = value;
    this.saveToServer();
  },

  getUniverseData(universeName, key, defaultValue) {
    if (this.universes[universeName] && this.universes[universeName][key] !== undefined) {
      return this.universes[universeName][key];
    }
    return defaultValue;
  },

  setCurrentUniverse(universeName) {
    this.currentUniverse = universeName;
    this.saveToServer();
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  setEWEData(key, value) {
    this.eweData[key] = value;
    this.saveToServer();
  },

  getEWEData(key) {
    return this.eweData[key];
  },

  saveToServer() {
    const { telegramId, username } = this.getUserData();
    if (!telegramId) {
      console.error('No Telegram ID available');
      return;
    }

    const currentUniverseData = this.universes[this.currentUniverse] || {};

    const dataToSend = {
      telegram_id: telegramId,
      username: username,
      totalClicks: this.totalClicks,
      upgrades: {
        damageLevel: currentUniverseData.damageLevel || 1,
        energyLevel: currentUniverseData.energyLevel || 1,
        regenLevel: currentUniverseData.regenLevel || 1,
        energy: currentUniverseData.energy || 1000,
        energyMax: currentUniverseData.energyMax || 1000,
        regenRate: currentUniverseData.regenRate || 1,
      },
      currentUniverse: this.currentUniverse,
    };

    console.log('Sending data to server:', dataToSend);

    fetch(`https://backend-gwc-1.onrender.com/api/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log('Data successfully saved to server');
      } else {
        console.error('Failed to save data to server:', data.error);
      }
    })
    .catch(error => {
      console.error('Error saving data to server:', error);
    });
  },

  loadFromServer(data) {
    this.totalClicks = data.totalClicks || 0;
    this.currentUniverse = data.currentUniverse || 'default';
    this.universes = data.universes || {};
    if (!this.universes[this.currentUniverse]) {
      this.universes[this.currentUniverse] = {
        damageLevel: 1,
        energyLevel: 1,
        regenLevel: 1,
        energy: 1000,
        energyMax: 1000,
        regenRate: 1,
      };
    }
    this.notifyListeners();
  },

  init() {
    const { telegramId, username } = this.getUserData();
    if (telegramId && username) {
      console.log('Initializing with Telegram ID:', telegramId, 'and username:', username);
      // Здесь можно добавить логику для загрузки данных с сервера
    }
  }
};

export default UniverseData;