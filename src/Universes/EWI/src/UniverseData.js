const UniverseData = {
  // ... (остальной код остается без изменений)

  async initFromServer(telegramId, username) {
    console.log('initFromServer вызван с параметрами:', telegramId, username);
    this.logToServer(`Инициализация с параметрами: telegramId=${telegramId}, username=${username}`);

    try {
      console.log('Отправка запроса на сервер');
      const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId, username }),
      });

      console.log('Получен ответ от сервера:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Данные от сервера:', data);
      this.logToServer(`Ответ сервера: ${JSON.stringify(data)}`);

      if (data.success) {
        this.setUserData(data.telegramId, data.username);
        this.setTotalClicks(data.totalClicks);
        this.setCurrentUniverse(data.currentUniverse);
        this.universes = data.universes || {};

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

  // ... (остальной код остается без изменений)

  saveToServer() {
    const { telegramId, username } = this.getUserData();
    this.logToServer(`Попытка сохранения данных для пользователя: ${telegramId}, ${username}`);
    if (!telegramId) {
      this.logToServer('Telegram ID недоступен');
      return;
    }

    const dataToSend = {
      telegramId,
      username,
      totalClicks: this.totalClicks,
      currentUniverse: this.currentUniverse,
      universes: this.universes
    };

    this.logToServer(`Отправка данных на сервер: ${JSON.stringify(dataToSend)}`);

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
        this.logToServer('Данные успешно сохранены на сервере');
        console.log('Данные успешно сохранены:', dataToSend);
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.sendData(JSON.stringify({action: 'save_success'}));
        }
      } else {
        this.logToServer(`Не удалось сохранить данные на сервере: ${data.error}`);
        console.error('Ошибка сохранения данных:', data.error);
      }
    })
    .catch(error => {
      this.logToServer(`Ошибка сохранения данных на сервере: ${error}`);
      console.error('Ошибка сохранения данных:', error);
    });
  },
};

export default UniverseData;