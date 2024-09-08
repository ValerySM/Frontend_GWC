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
      
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('Telegram WebApp API не доступен');
        setIsLoading(false);
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.expand();
      tg.enableClosingConfirmation();

      // Получаем параметры из URL
      const urlParams = new URLSearchParams(window.location.search);
      const telegramId = urlParams.get('telegram_id');
      const username = urlParams.get('username');

      console.log('URL параметры:', { telegramId, username });

      if (!telegramId || !username) {
        console.error('Данные пользователя недоступны в URL');
        UniverseData.logToServer('Данные пользователя недоступны в URL');
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

          tg.ready();
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