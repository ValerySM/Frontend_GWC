import axios from 'axios';

const API_BASE_URL = 'https://backend-gwc-1.onrender.com';

const UniverseData = {
  telegramId: '5859381541', // Фиксированный telegram_id для теста
  totalClicks: null,
  isDataLoaded: false, // Указывает, загружены ли данные

  async initFromServer() {
    console.log('Инициализация с сервера для Telegram ID:', this.telegramId);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user?telegram_id=${this.telegramId}`);
      console.log('Ответ сервера:', response.data);

      if (response.data.success) {
        this.setTotalClicks(response.data.totalClicks); // Устанавливаем клики из ответа сервера
        this.isDataLoaded = true; // Данные загружены успешно
        console.log('Данные установлены в UniverseData. Всего кликов:', this.totalClicks);
        return true;
      } else {
        throw new Error(response.data.error || 'Неизвестная ошибка при загрузке данных');
      }
    } catch (error) {
      console.error('Ошибка при инициализации данных с сервера:', error.response ? error.response.data : error.message);
      return false;
    }
  },

  getUserData() {
    return { telegramId: this.telegramId };
  },

  getTotalClicks() {
    if (!this.isDataLoaded) {
      console.warn('Попытка получить totalClicks до загрузки данных');
      return 0;
    }
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    console.log('Устанавливаем количество кликов:', clicks);
    this.totalClicks = clicks;
    this.notifyListeners(); // Уведомляем слушателей об изменении данных
  },

  incrementTotalClicks() {
    if (!this.isDataLoaded) {
      console.warn('Попытка увеличить totalClicks до загрузки данных');
      return 0;
    }
    this.totalClicks += 1;
    console.log('Количество кликов увеличено:', this.totalClicks);
    this.notifyListeners();
    return this.totalClicks;
  },

  listeners: [],

  addListener(callback) {
    this.listeners.push(callback); // Добавляем нового слушателя
  },

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback); // Убираем слушателя
  },

  notifyListeners() {
    console.log('Уведомляем слушателей. Текущие клики:', this.totalClicks);
    this.listeners.forEach(listener => listener(this.totalClicks));
  },

  async saveToServer() {
    if (!this.isDataLoaded) {
      console.warn('Попытка сохранить данные до их загрузки');
      return;
    }
    const dataToSend = {
      telegram_id: this.telegramId,
      totalClicks: this.totalClicks
    };

    console.log('Отправляем данные на сервер:', dataToSend);

    try {
      const response = await axios.put(`${API_BASE_URL}/api/users`, dataToSend);
      if (response.data.success) {
        console.log('Данные успешно сохранены на сервере');
      } else {
        console.log('Не удалось сохранить данные на сервере:', response.data.error);
      }
      return response.data;
    } catch (error) {
      console.log('Ошибка при сохранении данных на сервере:', error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

export default UniverseData;
