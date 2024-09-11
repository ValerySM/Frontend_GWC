import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const initApp = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const telegramId = params.get('telegram_id');
        const username = params.get('username');

        if (telegramId && username) {
          const success = await UniverseData.initFromServer(telegramId, username);
          if (success) {
            setIsAuthenticated(true);
            UniverseData.logToServer('Аутентификация успешна через URL параметры');
          } else {
            throw new Error('Не удалось загрузить данные пользователя');
          }
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

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <div>Ошибка аутентификации. Пожалуйста, попробуйте снова через Telegram бот.</div>;
  }

  return (
    <div className="App">
      <UniverseSwitcher 
        currentUniverse={UniverseData.getCurrentUniverse()} 
        setCurrentUniverse={(universe) => UniverseData.setCurrentUniverse(universe)}
      />
      <Switch>
        <Route exact path="/" render={() => {
          switch(UniverseData.getCurrentUniverse()) {
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