import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const initApp = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const telegramId = params.get('telegram_id');
        const username = params.get('username');

        if (telegramId && username) {
          UniverseData.initFromURL(params);
          setIsAuthenticated(true);
          UniverseData.logToServer('Данные инициализированы из URL параметров');
        } else if (window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.expand();
          tg.enableClosingConfirmation();

          const initData = tg.initDataUnsafe;
          if (!initData || !initData.user) {
            throw new Error('Данные пользователя недоступны в Telegram WebApp');
          }

          const { id, username: tgUsername, first_name } = initData.user;
          const displayName = tgUsername || first_name;

          const success = await UniverseData.initFromServer(id.toString(), displayName);
          if (success) {
            setIsAuthenticated(true);
            UniverseData.logToServer('Аутентификация успешна через Telegram WebApp');
          } else {
            throw new Error('Не удалось загрузить данные пользователя через Telegram WebApp');
          }
        } else {
          throw new Error('Нет доступных данных для аутентификации');
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

    initApp();
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
      <UniverseSwitcher currentUniverse={UniverseData.currentUniverse} setCurrentUniverse={(universe) => {
        UniverseData.currentUniverse = universe;
        // Возможно, вам нужно будет сохранить это изменение на сервере
      }} />
      <Switch>
        <Route exact path="/" render={() => {
          switch(UniverseData.currentUniverse) {
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