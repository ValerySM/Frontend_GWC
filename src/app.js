import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EatsApp from './Universes/EWI/EatsApp';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const tg = window.Telegram?.WebApp;

        // Проверяем, работает ли приложение внутри Telegram
        if (tg) {
          setIsTelegramWebApp(true);  // Telegram WebApp активен
          tg.ready();
          tg.expand();

          const initData = tg.initDataUnsafe;
          console.log('Telegram init data:', initData);

          if (initData && initData.user) {
            const response = await axios.post(`${BACKEND_URL}/auth`, { user_id: initData.user.id.toString() });
            setUserData(response.data);
            setIsLoading(false);
          } else {
            throw new Error('Не удалось получить данные пользователя из Telegram');
          }
        } else {
          throw new Error('Приложение запущено вне Telegram');
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setError(error.message || 'Произошла ошибка');
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (!isTelegramWebApp) {
    return <div>Приложение работает только внутри Telegram WebApp.</div>;
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!userData) {
    return <div>Нет данных пользователя. Попробуйте перезагрузить приложение.</div>;
  }

  console.log('Данные пользователя для передачи в EatsApp:', userData);

  return (
    <div className="App">
      <EatsApp userData={userData} />
    </div>
  );
}

export default App;
