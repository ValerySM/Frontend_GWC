import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import EatsApp from './Universes/EWI/EatsApp';
import UniverseData from './UniverseData';

function App() {
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

      const { id: telegramId } = initData.user;

      try {
        const success = await UniverseData.initFromServer(telegramId.toString());
        
        if (success) {
          console.log('Данные успешно загружены');
          setIsAuthenticated(true);
          tg.ready();
        } else {
          setIsAuthenticated(false);
          console.error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка во время аутентификации:', error);
        setIsAuthenticated(false);
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
        <Switch>
          <Route exact path="/" component={EatsApp} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;