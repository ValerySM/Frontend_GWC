import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';
import { logToServer } from './services/apiService';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initTelegramApp = async () => {
      console.log('Начало инициализации Telegram App');
      try {
        if (!window.Telegram || !window.Telegram.WebApp) {
          throw new Error('Telegram WebApp API не доступен');
        }

        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();

        const initData = tg.initDataUnsafe;
        if (!initData || !initData.user) {
          throw new Error('Данные пользователя недоступны');
        }

        const { id: telegramId, username, first_name } = initData.user;
        const displayName = username || first_name;

        console.log('Попытка инициализации с сервера', { telegramId, displayName });
        const success = await UniverseData.initFromServer(telegramId.toString(), displayName);
        
        if (success) {
          console.log('Установленные данные:', {
            telegramId: UniverseData.getUserData().telegramId,
            username: UniverseData.getUserData().username,
            totalClicks: UniverseData.getTotalClicks(),
            currentUniverse: UniverseData.getCurrentUniverse()
          });

          setCurrentUniverse(UniverseData.getCurrentUniverse());
          setIsAuthenticated(true);
          await logToServer('Аутентификация успешна');

          tg.ready();
        } else {
          throw new Error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка во время инициализации:', error);
        await logToServer(`Ошибка инициализации: ${error.message}`);
        setError(error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
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

  if (error) {
    return <div>Произошла ошибка: {error}</div>;
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
            console.log('Рендеринг вселенной:', currentUniverse);
            switch(currentUniverse) {
              case 'EatsApp':
                return <EatsApp />;
              case 'First':
                return <EWE />;
              case 'EcoGame':
                return <EcoGame />;
              default:
                console.log('Неизвестная вселенная:', currentUniverse);
                return <div>Неизвестная вселенная</div>;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;