import React, { useState, useEffect } from 'react';
import '../css/app.css'; 
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');

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
