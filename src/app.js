import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
    const initApp = async () => {
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('Telegram WebApp API не доступен');
        setIsLoading(false);
        return;
      }

      const tg = window.Telegram.WebApp;

      tg.expand();
      tg.enableClosingConfirmation();

      const urlParams = new URLSearchParams(window.location.search);
      const telegramId = urlParams.get('telegram_id');
      const username = urlParams.get('username');
      const totalClicks = parseInt(urlParams.get('totalClicks'), 10) || 0;

      if (!telegramId || !username) {
        console.error('Данные пользователя недоступны');
        setIsLoading(false);
        return;
      }

      try {
        UniverseData.setUserData(telegramId, username);
        UniverseData.setTotalClicks(totalClicks);
        UniverseData.setCurrentUniverse('EatsApp'); // Или другая начальная вселенная

        console.log('Данные установлены в UniverseData:', JSON.stringify(UniverseData));

        setIsAuthenticated(true);
        UniverseData.logToServer('Аутентификация успешна');

        tg.ready();
      } catch (error) {
        console.error('Ошибка во время инициализации:', error);
        UniverseData.logToServer(`Ошибка инициализации: ${error.message}`);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      console.log('Нажата кнопка "Назад"');
    };

    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.onEvent('backButtonClicked', handleBackButton);
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.offEvent('backButtonClicked', handleBackButton);
      }
    };
  }, []);

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        {isLoading ? (
          <div>Загрузка...</div>
        ) : isAuthenticated ? (
          <>
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
          </>
        ) : (
          <div>Ошибка аутентификации. Пожалуйста, попробуйте снова через Telegram бот.</div>
        )}
      </div>
    </Router>
  );
}

export default App;