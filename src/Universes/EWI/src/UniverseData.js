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

  init() {
    console.log('Initializing UniverseData');
    if (window.Telegram && window.Telegram.WebApp) {
      const webAppData = window.Telegram.WebApp.initDataUnsafe;
      console.log('WebApp initDataUnsafe:', webAppData);
      
      if (webAppData && webAppData.user) {
        this.telegramId = webAppData.user.id.toString();
        this.username = webAppData.user.username || `${webAppData.user.first_name} ${webAppData.user.last_name}`.trim();
        console.log(`Initialized with Telegram data: ID=${this.telegramId}, Username=${this.username}`);
        return true;
      } else {
        console.error('WebApp user data is not available');
        return false;
      }
    } else {
      console.error('Telegram WebApp is not available');
      return false;
    }
  },

  async initFromServer() {
    if (!this.telegramId || !this.username) {
      console.error('Telegram ID or Username is not set. Call init() first.');
      return false;
    }

    console.log(`Initializing from server for: ID=${this.telegramId}, Username=${this.username}`);
    
    try {
      const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: this.telegramId, username: this.username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        this.totalClicks = data.totalClicks || 0;
        this.currentUniverse = data.currentUniverse || 'default';
        this.universes = data.universes || {};
        console.log('Data successfully loaded from server');
        return true;
      } else {
        throw new Error(data.error || 'Unknown error while loading data');
      }
    } catch (error) {
      console.error('Error initializing data from server:', error);
      return false;
    }
  },



  getUserData() {
    return { telegramId: this.telegramId, username: this.username };
  },

getTotalClicks() {
    return this.totalClicks;
  },

  setTotalClicks(clicks) {
    this.totalClicks = clicks;
    this.notifyListeners();
    console.log(`Total clicks set to: ${clicks}`);
  },

  // ... (остальные методы остаются без изменений)

  saveToServer() {
    if (!this.telegramId || !this.username) {
      console.error('Cannot save: Telegram ID or Username is not set');
      return;
    }

    const dataToSend = {
      telegramId: this.telegramId,
      username: this.username,
      totalClicks: this.totalClicks,
      currentUniverse: this.currentUniverse,
      universes: this.universes
    };

    console.log('Saving data to server:', dataToSend);

    fetch('https://backend-gwc-1.onrender.com/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log('Data successfully saved to server');
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.sendData(JSON.stringify({action: 'save_success'}));
        }
      } else {
        console.error('Failed to save data to server:', data.error);
      }
    })
    .catch(error => {
      console.error('Error saving data to server:', error);
    });
  },
};

export default UniverseData;