const UniverseData = {
  telegramId: null,
  username: null,
  totalClicks: 0,

  setUserData(id, name) {
    console.log('Установка данных пользователя:', id, name);
    this.telegramId = id;
    this.username = name;
    sessionStorage.setItem('telegramId', id);
    sessionStorage.setItem('username', name);
  },

  getUserData() {
    if (!this.telegramId || !this.username) {
      this.telegramId = sessionStorage.getItem('telegramId');
      this.username = sessionStorage.getItem('username');
    }
    return { telegramId: this.telegramId, username: this.username };
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    this.totalClicks = clicks;
    this.notifyListeners();
    this.saveToServer();
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

  saveToServer() {
    const { telegramId, username } = this.getUserData();
    if (!telegramId) {
      console.error('Telegram ID недоступен');
      return;
    }

    const dataToSend = {
      telegram_id: telegramId,
      username: username,
      totalClicks: this.totalClicks
    };

    console.log('Отправка данных на сервер:', dataToSend);

    fetch('https://backend-gwc-1.onrender.com/api/users', {
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
        console.log('Данные успешно сохранены на сервере');
      } else {
        console.error('Не удалось сохранить данные на сервере:', data.error);
      }
    })
    .catch(error => {
      console.error('Ошибка сохранения данных на сервере:', error);
    });
  },

  loadFromServer(data) {
    console.log('Загрузка данных с сервера:', data);
    this.totalClicks = data.totalClicks || 0;
    this.notifyListeners();
  },

  init() {
    const { telegramId, username } = this.getUserData();
    if (telegramId && username) {
      console.log(`Инициализация с Telegram ID: ${telegramId} и именем пользователя: ${username}`);
    } else {
      console.log('Инициализация не удалась: отсутствует Telegram ID или имя пользователя');
    }
  }
};

export default UniverseData;