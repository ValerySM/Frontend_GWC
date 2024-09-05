const UniverseData = {
  telegramId: null,
  username: null,
  totalClicks: 0,
  gameScores: {
    exampleGame: 0,
  },
  universes: {},
  currentUniverse: 'default',

  async initFromServer(telegramId, username) {
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

      if (data.success) {
        this.telegramId = data.telegram_id;
        this.username = data.username;
        this.totalClicks = data.totalClicks;
        this.currentUniverse = data.currentUniverse;
        this.universes = data.universes || {};

        return true;
      } else {
        throw new Error(data.error || 'Unknown error during data load');
      }
    } catch (error) {
      console.error('Error initializing data from server:', error);
      return false;
    }
  },

  saveToServer() {
    if (!this.telegramId) {
      console.error('Telegram ID unavailable');
      return;
    }

    const dataToSend = {
      telegram_id: this.telegramId,
      username: this.username,
      totalClicks: this.totalClicks,
      currentUniverse: this.currentUniverse,
      universes: this.universes,
    };

    fetch('https://backend-gwc-1.onrender.com/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
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