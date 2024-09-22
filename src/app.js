import React, { useState, useEffect } from 'react';
import '../css/app.css'; 
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

const BACKEND_URL = 'https://backend-gwc.onrender.com'; // Убедитесь, что это правильный URL вашего бэкенда

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    const initData = tg.initDataUnsafe;
    if (initData && initData.user) {
      const userIdFromTg = initData.user.id.toString();
      setUserId(userIdFromTg);
      
      // Аутентификация пользователя на бэкенде
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
        UniverseData.setUserData(data); // Предположим, что у нас есть такой метод в UniverseData
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
        return <EatsApp userId={userId} />;
      case 'First':
        return <EWE userId={userId} />;
      case 'EcoGame':
        return <EcoGame userId={userId} />;
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
        {renderGame()}
      </header>
    </div>
  );
}

export default App;