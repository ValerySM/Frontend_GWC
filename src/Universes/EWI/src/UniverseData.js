const UniverseData = {
  sessionToken: null,
  totalClicks: 0,
  upgrades: {
    damageLevel: 1,
    energyLevel: 1,
    regenLevel: 1
  },
  currentUniverse: 'default',
  
  setSessionToken(token) {
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
  },

  getSessionToken() {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('sessionToken');
    }
    return this.sessionToken;
  },

  clearSessionToken() {
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
  },

  getTotalClicks() {
    return this.totalClicks;
  },

  setTotalClicks(newTotal) {
    this.totalClicks = newTotal;
    this.saveToServer();
  },

  setUpgradeLevel(upgradeType, level) {
    this.upgrades[upgradeType] = level;
    this.saveToServer();
  },

  getUpgradeLevel(upgradeType) {
    return this.upgrades[upgradeType] || 1;
  },

  setCurrentUniverse(universeName) {
    this.currentUniverse = universeName;
    this.saveToServer();
  },

  getCurrentUniverse() {
    return this.currentUniverse;
  },

  saveToServer() {
    const token = this.getSessionToken();
    if (!token) {
      console.error('No session token available');
      return;
    }

    fetch(`https://gwc-backend.onrender.com/api/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        totalClicks: this.totalClicks,
        upgrades: this.upgrades,
        currentUniverse: this.currentUniverse,
      }),
    })
      .then(response => {
        if (response.status === 401) {
          this.clearSessionToken();
          // Здесь можно добавить логику для перенаправления пользователя на повторную аутентификацию
        }
        return response.json();
      })
      .then(data => {
        if (!data.success) {
          console.error('Failed to save data to server');
        }
      })
      .catch(error => {
        console.error('Error saving data to server:', error);
      });
  },

  loadFromServer(data) {
    this.totalClicks = data.totalClicks || 0;
    this.upgrades = data.upgrades || {
      damageLevel: 1,
      energyLevel: 1,
      regenLevel: 1
    };
    this.currentUniverse = data.currentUniverse || 'default';
  },

  init() {
    const token = this.getSessionToken();
    if (token) {
      // Здесь можно добавить логику для проверки валидности токена на сервере
    }
  }
};

export default UniverseData;