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
    console.log('Установка данных пользователя:', id, name);
    this.telegramId = id;
    this.username = name;
    this.logToServer(`Данные пользователя установлены: ${id}, ${name}`);
  },

  getUserData() {
    console.log('Получение данных пользователя:', this.telegramId, this.username);
    return { telegramId: this.telegramId, username: this.username };
  },

  clearUserData() {
    this.telegramId = null;
    this.username = null;
    this.logToServer('Данные пользователя очищены');
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
      this.logToServer(`Обновлен счет ${gameType}: ${this.gameScores[gameType]}, Новое общее количество кликов: ${this.totalClicks}`);
    } else {
      this.logToServer(`Неизвестный тип игры: ${gameType}`);
    }
  },

  setUniverseData(universeName, key, value) {
    if (!this.universes[universeName]) {
      this.universes[universeName] = {};
    }
    this.universes[universeName][key] = value;
    this.saveToServer();
    this.logToServer(`Установлены данные вселенной: ${universeName}.${key} = ${value}`);
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
    }).catch(error => console.error('Ошибка логирования на сервер:', error));
  },

  saveToServer() {
    const { telegramId, username } = this.getUserData();
    this.logToServer(`Попытка сохранения данных для пользователя: ${telegramId}, ${username}`);
    if (!telegramId) {
      this.logToServer('Telegram ID недоступен');
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

    this.logToServer(`Отправка данных на сервер: ${JSON.stringify(dataToSend)}`);

    fetch(`https://backend-gwc-1.onrender.com/api/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP! статус: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        this.logToServer('Данные успешно сохранены на сервере');
      } else {
        this.logToServer(`Не удалось сохранить данные на сервере: ${data.error}`);
      }
    })
    .catch(error => {
      this.logToServer(`Ошибка сохранения данных на сервере: ${error}`);
    });
  },

  loadFromServer(data) {
    this.totalClicks = data.totalClicks || 0;
    this.currentUniverse = data.currentUniverse || 'default';
    this.universes = data.universes || {};
    this.notifyListeners();
    this.logToServer('Данные загружены с сервера');
  },

  init() {
    const { telegramId, username } = this.getUserData();
    if (telegramId && username) {
      this.logToServer(`Инициализация с Telegram ID: ${telegramId} и именем пользователя: ${username}`);
    } else {
      this.logToServer('Инициализация не удалась: отсутствует Telegram ID или имя пользователя');
    }
  }
};

export default UniverseData;