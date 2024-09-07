import { authenticateUser, updateUserData, logToServer } from './services/apiService';

class UniverseData {
  constructor() {
    this.telegramId = null;
    this.totalClicks = 0;
    this.isLoading = true;
  }

  async initFromServer(telegramId) {
    this.isLoading = true;
    console.log('initFromServer вызван с параметром:', telegramId);
    try {
      const data = await authenticateUser(telegramId);
      console.log('Полученные данные с сервера:', data);
      if (data.success) {
        this.telegramId = data.telegram_id;
        this.totalClicks = data.totalClicks;
        console.log('Данные установлены в UniverseData:', JSON.stringify(this));
        this.isLoading = false;
        return true;
      }
      throw new Error(data.error || 'Неизвестная ошибка при загрузке данных');
    } catch (error) {
      console.error('Ошибка при инициализации данных с сервера:', error);
      this.isLoading = false;
      return false;
    }
  }

  getTotalClicks() {
    return this.totalClicks;
  }

  setTotalClicks(clicks) {
    console.log('setTotalClicks вызван с:', clicks);
    this.totalClicks = clicks;
    this.saveToServer();
  }

  isDataLoaded() {
    const result = !this.isLoading && this.telegramId !== null;
    console.log('isDataLoaded вызван. Результат:', result, 'Состояние:', JSON.stringify(this));
    return result;
  }

  async saveToServer() {
    if (!this.isDataLoaded()) {
      console.warn('Попытка сохранения данных до их полной загрузки');
      return;
    }

    const dataToSend = {
      telegram_id: this.telegramId,
      totalClicks: this.totalClicks
    };

    try {
      await updateUserData(dataToSend);
      console.log('Данные успешно сохранены на сервере');
    } catch (error) {
      console.error('Ошибка сохранения данных на сервере:', error);
    }
  }
}

const universeData = new UniverseData();
export default universeData;