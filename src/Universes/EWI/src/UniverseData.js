class UniverseData {
  constructor() {
    this.listeners = [];
    this.universeData = {
      totalClicks: 0,
      energy: 1000,
      energyMax: 1000,
      regenRate: 1,
      damageLevel: 1,
      energyLevel: 1,
      regenLevel: 1,
      currentUniverse: 'default',
      telegramId: null,
      username: '',
    };
  }

  getUserData() {
    return {
      telegramId: this.universeData.telegramId,
      username: this.universeData.username,
    };
  }

  getCurrentUniverse() {
    return this.universeData.currentUniverse;
  }

  getTotalClicks() {
    return this.universeData.totalClicks;
  }

  setTotalClicks(newTotal) {
    this.universeData.totalClicks = newTotal;
    this.notifyListeners(newTotal);
  }

  getUniverseData(key, defaultValue = 0) {
    return this.universeData[key] || defaultValue;
  }

  setUniverseData(key, value) {
    this.universeData[key] = value;
    this.notifyListeners();
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notifyListeners(newTotal) {
    this.listeners.forEach(listener => listener(newTotal));
  }
}

const universeData = new UniverseData();
export default universeData;
