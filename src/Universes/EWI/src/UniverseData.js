const UniverseData = {
  telegramId: null,
  totalClicks: 0,
  currentUniverse: 'default',
  
  async setCurrentUniverse(universeName) {
    this.currentUniverse = universeName;
    await this.saveToServer();
    this.logToServer(`Текущая вселенная установлена на: ${universeName}`);
  },

  async incrementTotalClicks(amount = 1) {
    this.totalClicks += amount;
    await this.saveToServer();
    return this.totalClicks;
  },

  async saveToServer() {
    try {
      const response = await fetch('https://backend-gwc-1.onrender.com/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id: this.telegramId,
          totalClicks: this.totalClicks,
          currentUniverse: this.currentUniverse,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log('Данные успешно сохранены на сервере');
      } else {
        console.error('Не удалось сохранить данные на сервере:', data.error);
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных на сервере:', error);
      throw error;
    }
  },

  logToServer(message) {
    fetch('https://backend-gwc-1.onrender.com/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        telegram_id: this.telegramId,
        message: message
      }),
    }).catch(error => console.error('Ошибка логирования на сервер:', error));
  },
};

export default UniverseData;
