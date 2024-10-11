import React, { useState, useEffect } from 'react';
import '../css/app.css'; 
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [userId, setUserId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTelegramWebApp = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        const telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
        console.log("Telegram User ID:", telegramUserId);
        setUserId(telegramUserId);
        setIsInitialized(true);
      } else {
        console.error("Telegram WebApp is not available");
      }
    };

    initTelegramWebApp();
  }, []);

  useEffect(() => {
    if (isInitialized && userId) {
      console.log("App initialized with user ID:", userId);
    }
  }, [isInitialized, userId]);

  const renderGame = () => {
    switch (currentUniverse) {
      case 'EatsApp':
        return <EatsApp userId={userId} />;
      case 'First':
        return <EWE userId={userId} />;
      case 'EcoGame':
        return <EcoGame userId={userId} />;
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

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