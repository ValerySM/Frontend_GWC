import React, { useState, useEffect } from 'react';
import '../css/app.css'; 
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const initData = tg.initDataUnsafe;
    if (initData && initData.user) {
      const userIdFromTg = initData.user.id.toString();
      
      fetch(`${BACKEND_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userIdFromTg }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('User data from backend:', data);
        UniverseData.setUserData(data);
        setIsDataLoaded(true);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error initializing user:', err);
        setError('Failed to initialize user data. Please try again.');
        setIsLoading(false);
      });
    } else {
      setError('User data not found in Telegram WebApp.');
      setIsLoading(false);
    }

    document.body.style.backgroundColor = tg.backgroundColor;
    document.body.style.color = tg.textColor;
  }, []);

  const renderGame = () => {
    switch (currentUniverse) {
      case 'EatsApp':
        return <EatsApp isDataLoaded={isDataLoaded} />;
      case 'First':
        return <EWE isDataLoaded={isDataLoaded} />;
      case 'EcoGame':
        return <EcoGame isDataLoaded={isDataLoaded} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <UniverseSwitcher 
          currentUniverse={currentUniverse} 
          setCurrentUniverse={setCurrentUniverse} 
        />
        {isDataLoaded && renderGame()}
      </header>
    </div>
  );
}

export default App;