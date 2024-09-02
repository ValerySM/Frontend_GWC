import React, { useState, useEffect } from 'react';
import '../css/app.css'; 
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        console.error('No authentication token provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://gwc-backend.onrender.com/api/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          UniverseData.loadFromServer(data.universe_data);
          UniverseData.setSessionToken(data.session_token);
          setCurrentUniverse(data.universe_data.currentUniverse);
        } else {
          console.error('Authentication failed');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }

      setIsLoading(false);
    };

    authenticateUser();
=======

  useEffect(() => {
    if (window.TelegramWebApps) {
      window.TelegramWebApps.ready();
      
      // Пример использования Telegram Web App API
      window.TelegramWebApps.onEvent('backButtonClicked', () => {
        console.log('Back button clicked');
      });

      // Пример получения данных из Telegram Web App
      console.log(window.TelegramWebApps.initData);
    }
>>>>>>> 292d65f42af9a23ed8a446ba1509a3ca26a165a5
  }, []);

  const renderGame = () => {
    switch (currentUniverse) {
      case 'EatsApp':
        return <EatsApp />;
      case 'First':
        return <EWE />;
      case 'EcoGame':
        return <EcoGame />;
      default:
        return null;
    }
  };

<<<<<<< HEAD
  if (isLoading) {
    return <div>Loading...</div>;
  }

=======
>>>>>>> 292d65f42af9a23ed8a446ba1509a3ca26a165a5
  return (
    <div className="App">
      <header className="App-header">
        <UniverseSwitcher currentUniverse={currentUniverse} setCurrentUniverse={setCurrentUniverse} />
        {renderGame()}
      </header>
    </div>
  );
}

export default App;
