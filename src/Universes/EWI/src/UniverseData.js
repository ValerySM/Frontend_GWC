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

  async initFromServer(telegramId, username) {
    console.log('initFromServer вызван с параметрами:', telegramId, username);
    try {
      const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegram_id: telegramId, username: username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ответ сервера:', data);

      if (data.success) {
        this.setUserData(data.telegram_id, data.username);
        this.setTotalClicks(data.universe_data.totalClicks);
        this.setCurrentUniverse(data.universe_data.currentUniverse);
        this.universes = data.universe_data.universes || {};

        console.log('Данные установлены в UniverseData:', JSON.stringify(this));
        this.logToServer('Данные успешно загружены с сервера');
        return true;
      } else {
        throw new Error(data.error || 'Неизвестная ошибка при загрузке данных');
      }
    } catch (error) {
      console.error('Ошибка при инициализации данных с сервера:', error);
      this.logToServer(`Ошибка при инициализации данных с сервера: ${error.message}`);
      return false;
    }
  },

  setUserData(id, name) {
    console.log('setUserData вызван с:', id, name);
    this.telegramId = id;
    this.username = name;
    this.logToServer(`Данные пользователя установлены: ${id}, ${name}`);
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

    const dataToSend = {
      telegram_id: telegramId,
      username: username,
      totalClicks: this.totalClicks,
      currentUniverse: this.currentUniverse,
      universes: this.universes
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
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.sendData(JSON.stringify({action: 'save_success'}));
        }
      } else {
        this.logToServer(`Не удалось сохранить данные на сервере: ${data.error}`);
      }
    })
    .catch(error => {
      this.logToServer(`Ошибка сохранения данных на сервере: ${error}`);
    });
  },
};

export default UniverseData;