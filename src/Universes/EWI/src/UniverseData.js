const UniverseData = {
  sessionToken: null,
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

  setSessionToken(token) {
    console.log('Setting session token:', token);
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
  },

  getSessionToken() {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('sessionToken');
    }
    return this.sessionToken;
  },

  clearSessionToken() {
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
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
    const token = this.getSessionToken();
    if (!token) {
      console.error('No session token available');
      return;
    }

    const currentUniverseData = this.universes[this.currentUniverse] || {};

    const dataToSend = {
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
    console.log('Session token:', token);

    fetch(`https://backend-gwc-1.onrender.com/api/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
  },

  init() {
    const token = this.getSessionToken();
    if (token) {
      console.log('Initializing with session token:', token);
      // Здесь можно добавить логику для проверки валидности токена на сервере
    }
  }
};

export default UniverseData;