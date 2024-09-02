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

    fetch(`https://gwc-backend.onrender.com/api/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        totalClicks: this.totalClicks,
        upgrades: {
          damageLevel: this.getUniverseData(this.currentUniverse, 'damageLevel', 1),
          energyLevel: this.getUniverseData(this.currentUniverse, 'energyLevel', 1),
          regenLevel: this.getUniverseData(this.currentUniverse, 'regenLevel', 1),
        },
        currentUniverse: this.currentUniverse,
      }),
    })
      .then(response => {
        if (response.status === 401) {
          this.clearSessionToken();
          // Здесь можно добавить логику для перенаправления пользователя на повторную аутентификацию
        }
        return response.json();
      })
      .then(data => {
        if (!data.success) {
          console.error('Failed to save data to server');
        }
      })
      .catch(error => {
        console.error('Error saving data to server:', error);
      });
  },

  loadFromServer(data) {
    this.totalClicks = data.totalClicks || 0;
    this.currentUniverse = data.currentUniverse || 'default';
    this.universes[this.currentUniverse] = {
      damageLevel: data.upgrades.damageLevel || 1,
      energyLevel: data.upgrades.energyLevel || 1,
      regenLevel: data.upgrades.regenLevel || 1,
    };
  },

  init() {
    const token = this.getSessionToken();
    if (token) {
      // Здесь можно добавить логику для проверки валидности токена на сервере
    }
  }
};

export default UniverseData;