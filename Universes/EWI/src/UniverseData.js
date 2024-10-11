const UniverseData = {
  totalClicks: 0,
  gameScores: {
    appleCatcher: 0,
    purblePairs: 0
  },
  universes: {},
  currentUniverse: 'default',
  
  // Добавляем объект для хранения данных EWE
  eweData: {
    tokens: 0,
    farmedTokens: 0,
    isFarming: false,
    startTime: null,
    elapsedFarmingTime: 0
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
    this.saveToLocalStorage();
    this.notifyListeners();
  },

  addGameScore(gameType, score) {
    if (gameType in this.gameScores) {
      this.gameScores[gameType] = score;
      this.totalClicks += score;
      this.saveToLocalStorage();
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
    this.saveToLocalStorage();
  },

  getUniverseData(universeName, key, defaultValue) {
    if (this.universes[universeName] && this.universes[universeName][key] !== undefined) {
      return this.universes[universeName][key];
    }
    return defaultValue;
  },

  setCurrentUniverse(universeName) {
    this.currentUniverse = universeName;
    this.saveToLocalStorage();
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  // Методы для работы с данными EWE
  setEWEData(key, value) {
    this.eweData[key] = value;
    this.saveToLocalStorage();
  },

  getEWEData(key) {
    return this.eweData[key];
  },

  saveToLocalStorage() {
    localStorage.setItem('universeData', JSON.stringify({
      totalClicks: this.totalClicks,
      gameScores: this.gameScores,
      universes: this.universes,
      currentUniverse: this.currentUniverse,
      eweData: this.eweData
    }));
  },

  loadFromLocalStorage() {
    const savedData = localStorage.getItem('universeData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.totalClicks = parsedData.totalClicks || 0;
      this.gameScores = parsedData.gameScores || {
        appleCatcher: 0,
        purblePairs: 0
      };
      this.universes = parsedData.universes || {};
      this.currentUniverse = parsedData.currentUniverse || 'default';
      this.eweData = parsedData.eweData || {
        tokens: 0,
        farmedTokens: 0,
        isFarming: false,
        startTime: null,
        elapsedFarmingTime: 0
      };
    } else {
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    this.totalClicks = 100000;
    this.gameScores = {
      appleCatcher: 0,
      purblePairs: 0
    };
    this.universes = {};
    this.currentUniverse = 'default';
    this.eweData = {
      tokens: 0,
      farmedTokens: 0,
      isFarming: false,
      startTime: null,
      elapsedFarmingTime: 0
    };
    this.saveToLocalStorage();
  },

  init() {
    this.loadFromLocalStorage();
  }
};

UniverseData.init();

export default UniverseData;