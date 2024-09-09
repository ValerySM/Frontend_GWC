import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function AppContent() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const initTelegramApp = async () => {
      try {
        if (!window.Telegram || !window.Telegram.WebApp) {
          throw new Error('Telegram WebApp API не доступен');
        }

        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();

        const params = new URLSearchParams(location.search);
        const telegramId = params.get('telegram_id');
        const username = params.get('username');

        let success;
        if (telegramId && username) {
          success = await UniverseData.initFromServer(telegramId, username);
          UniverseData.logToServer('Попытка аутентификации через URL параметры');
        } else {
          const initData = tg.initDataUnsafe;
          if (!initData || !initData.user) {
            throw new Error('Данные пользователя недоступны');
          }
          const { id, username, first_name } = initData.user;
          const displayName = username || first_name;
          success = await UniverseData.initFromServer(id.toString(), displayName);
          UniverseData.logToServer('Попытка аутентификации через Telegram WebApp');
        }

        if (success) {
          setCurrentUniverse(UniverseData.getCurrentUniverse());
          setIsAuthenticated(true);
          UniverseData.logToServer('Аутентификация успешна');
        } else {
          throw new Error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        UniverseData.logToServer(`Ошибка аутентификации: ${error.message}`);
        setError(error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.ready();
        }
      }
    };

    initTelegramApp();
  }, [location]);

  useEffect(() => {
    const handleBackButton = () => {
      console.log('Нажата кнопка "Назад"');
      // Здесь можно добавить логику навигации
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
    return <div>Загрузка приложения...</div>;
  }

  if (!isAuthenticated) {
    return <div>Ошибка аутентификации: {error || 'Неизвестная ошибка'}. Пожалуйста, попробуйте снова через Telegram бот.</div>;
  }

  return (
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
        {/* Добавьте дополнительные маршруты здесь, если необходимо */}
      </Switch>
    </div>
  );
}

function App() {
  return (
    <Router basename="/Frontend_GWC">
      <AppContent />
    </Router>
  );
}

export default App;