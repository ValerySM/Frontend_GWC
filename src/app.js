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

      console.log('Данные пользователя из Telegram:', { telegramId, displayName });

      if (!telegramId) {
        console.error('telegramId отсутствует в данных пользователя Telegram');
        setIsLoading(false);
        return;
      }

      try {
        const success = await UniverseData.initFromServer(telegramId.toString(), displayName);
        
        console.log('Результат initFromServer:', success);
        console.log('UniverseData после initFromServer:', JSON.stringify(UniverseData));

        if (success) {
          console.log('Установленные данные:', {
            telegramId: UniverseData.getUserData().telegramId,
            username: UniverseData.getUserData().username,
            totalClicks: UniverseData.getTotalClicks(),
            currentUniverse: UniverseData.getCurrentUniverse()
          });

          setCurrentUniverse(UniverseData.getCurrentUniverse());
          setIsAuthenticated(true);
          UniverseData.logToServer('Аутентификация успешна');

          tg.ready();
        } else {
          setIsAuthenticated(false);
          UniverseData.logToServer('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка во время аутентификации:', error);
        UniverseData.logToServer(`Ошибка аутентификации: ${error.message}`);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    initTelegramApp();
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