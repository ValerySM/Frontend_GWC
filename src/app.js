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
      console.log('Initializing Telegram App');
      
      let telegramId, username;

      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        // Получаем данные из Telegram WebApp
        const initData = tg.initDataUnsafe;
        if (initData && initData.user) {
          telegramId = initData.user.id.toString();
          username = initData.user.username || initData.user.first_name;
        }
      }

      // Если данные не получены из Telegram WebApp, пробуем получить из URL
      if (!telegramId || !username) {
        const urlParams = new URLSearchParams(window.location.search);
        telegramId = urlParams.get('telegramId');
        username = urlParams.get('username');
      }

      console.log('Полученные данные пользователя:', { telegramId, username });

      if (!telegramId || !username) {
        console.error('Данные пользователя недоступны');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Инициализация данных с сервера');
        const success = await UniverseData.initFromServer(telegramId, username);
        
        if (success) {
          console.log('Данные успешно загружены');
          const userData = UniverseData.getUserData();
          console.log('Установленные данные:', {
            telegramId: userData.telegramId,
            username: userData.username,
            totalClicks: UniverseData.getTotalClicks(),
            currentUniverse: UniverseData.getCurrentUniverse()
          });

          setCurrentUniverse(UniverseData.getCurrentUniverse());
          setIsAuthenticated(true);
          UniverseData.logToServer('Аутентификация успешна');

          if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
          }
        } else {
          console.error('Не удалось загрузить данные пользователя');
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