import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticateUser = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const telegramId = urlParams.get('telegram_id');
  const username = urlParams.get('username');

  UniverseData.logToServer(`Initializing with: ${telegramId}, ${username}`);

  if (!telegramId || !username) {
    UniverseData.logToServer('Missing telegram_id or username');
    console.error('No Telegram ID or username provided');
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegram_id: telegramId, username: username }),
    });

    const data = await response.json();

    if (data.success) {
      UniverseData.setUserData(telegramId, username);
      UniverseData.loadFromServer(data.universe_data);
      setCurrentUniverse(data.universe_data.currentUniverse);
      setIsAuthenticated(true);
      UniverseData.logToServer('Authentication successful');
    } else {
      console.error('Authentication failed');
      UniverseData.logToServer('Authentication failed');
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    UniverseData.logToServer(`Authentication error: ${error.message}`);
  }

  setIsLoading(false);
};

    authenticateUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Authentication failed. Please try again via Telegram bot.</div>;
  }

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <UniverseSwitcher currentUniverse={currentUniverse} setCurrentUniverse={setCurrentUniverse} />
        <Switch>
          <Route exact path="/" render={() => {
            switch(currentUniverse) {
              case 'EatsApp':
                return <EatsApp />;
              case 'First':
                return <EWE />;
              case 'EcoGame':
                return <EcoGame />;
              default:
                return <EatsApp />;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;