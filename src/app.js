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
    const initTelegramApp = async () => {
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('Telegram WebApp API не доступен');
        setIsLoading(false);
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.expand();
      tg.enableClosingConfirmation();

      const initData = tg.initDataUnsafe;
      if (!initData || !initData.user) {
        console.error('Данные пользователя недоступны');
        setIsLoading(false);
        return;
      }

      const { id: telegramId, username, first_name } = initData.user;
      const displayName = username || first_name;

      try {
        const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telegram_id: telegramId.toString(), username: displayName }),
        });

        const data = await response.json();
        console.log('Полученные данные от сервера:', data);

        if (data.success) {
          UniverseData.setUserData(data.telegram_id.toString(), data.username);
          UniverseData.loadFromServer(data.universe_data);
          setIsAuthenticated(true);
          tg.ready();
        } else {
          console.error('Аутентификация не удалась');
        }
      } catch (error) {
        console.error('Ошибка во время аутентификации:', error);
      }

      setIsLoading(false);
    };

    initTelegramApp();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <div>Ошибка аутентификации. Пожалуйста, попробуйте снова через Telegram бот.</div>;
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