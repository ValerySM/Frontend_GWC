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
    console.log('Setting user data:', id, name);
    this.telegramId = id;
    this.username = name;
    this.logToServer(`User data set: ${id}, ${name}`);
  },

  getUserData() {
    console.log('Getting user data:', this.telegramId, this.username);
    return { telegramId: this.telegramId, username: this.username };
  },

  clearUserData() {
    this.telegramId = null;
    this.username = null;
    this.logToServer('User data cleared');
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
      this.logToServer(`Updated ${gameType} score: ${this.gameScores[gameType]}, New total clicks: ${this.totalClicks}`);
    } else {
      this.logToServer(`Unknown game type: ${gameType}`);
    }
  },

  setUniverseData(universeName, key, value) {
    if (!this.universes[universeName]) {
      this.universes[universeName] = {};
    }
    this.universes[universeName][key] = value;
    this.saveToServer();
    this.logToServer(`Set universe data: ${universeName}.${key} = ${value}`);
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
    this.currentUniverse = universeName;
    this.saveToServer();
    this.logToServer(`Current universe set to: ${universeName}`);
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  setEWEData(key, value) {
    this.eweData[key] = value;
    this.saveToServer();
    this.logToServer(`Set EWE data: ${key} = ${value}`);
  },

  getEWEData(key) {
    return this.eweData[key];
  },

  logToServer(message) {
    const { telegramId, username } = this.getUserData();
    fetch(`https://backend-gwc-1.onrender.com/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        username: username,
        message: message
      }),
    }).catch(error => console.error('Error logging to server:', error));
  },

  saveToServer() {
    const { telegramId, username } = this.getUserData();
    this.logToServer(`Attempting to save data for user: ${telegramId}, ${username}`);
    if (!telegramId) {
      this.logToServer('No Telegram ID available');
      return;
    }

    const currentUniverseData = this.universes[this.currentUniverse] || {};

    const dataToSend = {
      telegram_id: telegramId,
      username: username,
      totalClicks: this.totalClicks,
      upgrades: currentUniverseData,
      currentUniverse: this.currentUniverse,
    };

    this.logToServer(`Sending data to server: ${JSON.stringify(dataToSend)}`);

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
        this.logToServer('Data successfully saved to server');
      } else {
        this.logToServer(`Failed to save data to server: ${data.error}`);
      }
    })
    .catch(error => {
      this.logToServer(`Error saving data to server: ${error}`);
    });
  },

  loadFromServer(data) {
    this.totalClicks = data.totalClicks || 0;
    this.currentUniverse = data.currentUniverse || 'default';
    this.universes = data.universes || {};
    this.notifyListeners();
    this.logToServer('Data loaded from server');
  },

  init() {
    const { telegramId, username } = this.getUserData();
    if (telegramId && username) {
      this.logToServer(`Initializing with Telegram ID: ${telegramId} and username: ${username}`);
    } else {
      this.logToServer('Initialization failed: missing Telegram ID or username');
    }
  }
};

export default UniverseData;