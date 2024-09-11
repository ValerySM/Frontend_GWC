const UniverseData = {
  telegramId: null,
  totalClicks: 0,

  async initFromServer(telegramId) {
    console.log('initFromServer вызван с параметром:', telegramId);
    try {
      const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegram_id: telegramId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ответ сервера:', data);

      if (data.success) {
        this.setUserData(data.telegram_id);
        this.setTotalClicks(data.totalClicks);
        console.log('Данные установлены в UniverseData:', JSON.stringify(this));
        return true;
      } else {
        throw new Error(data.error || 'Неизвестная ошибка при загрузке данных');
      }
    } catch (error) {
      console.error('Ошибка при инициализации данных с сервера:', error);
      return false;
    }
  },

  setUserData(id) {
    console.log('setUserData вызван с:', id);
    this.telegramId = id;
  },

  getUserData() {
    console.log('getUserData вызван. telegramId:', this.telegramId);
    return { telegramId: this.telegramId };
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    console.log('setTotalClicks вызван с:', clicks);
    this.totalClicks = clicks;
    this.notifyListeners();
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
    const { telegramId } = this.getUserData();
    if (!telegramId) {
      console.log('Telegram ID недоступен');
      return;
    }

    const dataToSend = {
      telegram_id: telegramId,
      totalClicks: this.totalClicks
    };

    console.log(`Отправка данных на сервер: ${JSON.stringify(dataToSend)}`);

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
        console.log('Данные успешно сохранены на сервере');
      } else {
        console.log(`Не удалось сохранить данные на сервере: ${data.error}`);
      }
    })
    .catch(error => {
      console.log(`Ошибка сохранения данных на сервере: ${error}`);
    });
  },
};

export default UniverseData;