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

      // Инициализация и настройка Telegram Mini App
      tg.expand(); // Расширяем приложение на весь экран
      tg.enableClosingConfirmation(); // Включаем подтверждение закрытия

      // Получаем данные пользователя
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

        console.log('Полученные данные от сервера:', data); // Лог для отладки

        if (data.success) {
          // Проверяем наличие всех необходимых полей
          if (data.telegram_id && data.username && 'totalClicks' in data && data.currentUniverse) {
            UniverseData.setUserData(data.telegram_id.toString(), data.username);
            UniverseData.setTotalClicks(data.totalClicks);
            UniverseData.setCurrentUniverse(data.currentUniverse);
            
            // Если universes существует, загружаем их
            if (data.universes) {
              Object.keys(data.universes).forEach(universeName => {
                UniverseData.setUniverseData(universeName, data.universes[universeName]);
              });
            }

            setCurrentUniverse(data.currentUniverse);
            setIsAuthenticated(true);
            UniverseData.logToServer('Аутентификация успешна');

            // Сообщаем Telegram, что приложение готово
            tg.ready();
          } else {
            console.error('Неполные данные получены от сервера');
            UniverseData.logToServer('Неполные данные получены от сервера');
          }
        } else {
          console.error('Аутентификация не удалась');
          UniverseData.logToServer('Аутентификация не удалась');
        }
      } catch (error) {
        console.error('Ошибка во время аутентификации:', error);
        UniverseData.logToServer(`Ошибка аутентификации: ${error.message}`);
      }

      setIsLoading(false);
    };

    initTelegramApp();
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      // Здесь можно добавить логику для обработки нажатия кнопки "Назад"
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