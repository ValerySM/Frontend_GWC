import React, { useState, useEffect } from 'react';
import '../css/app.css'; 
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('user_id');
    
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
      UniverseData.initializeUser(userIdFromUrl)
        .then(() => {
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error initializing user:', err);
          setError('Failed to initialize user data. Please try again.');
          setIsLoading(false);
        });
    } else {
      setError('User ID not found in URL.');
      setIsLoading(false);
    }

    if (window.TelegramWebApps) {
      window.TelegramWebApps.ready();
      window.TelegramWebApps.onEvent('backButtonClicked', () => {
        console.log('Back button clicked');
      });
      console.log(window.TelegramWebApps.initData);
    }
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