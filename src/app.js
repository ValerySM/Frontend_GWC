import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EatsApp from './Universes/EWI/EatsApp';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const tg = window.Telegram.WebApp;

        // Telegram WebApp API инициализация
        tg.ready();
        tg.expand();  // Расширяет WebApp для лучшего использования пространства на мобильных устройствах

        console.log('Telegram WebApp initialized');

        const initData = tg.initDataUnsafe;
        console.log('Telegram init data:', initData);

        if (initData && initData.user) {
          const response = await axios.post(`${BACKEND_URL}/auth`, { user_id: initData.user.id.toString() });
          setUserData(response.data);
          setIsLoading(false); // Останавливаем загрузку
        } else {
          throw new Error('Не удалось получить данные пользователя из Telegram');
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setError(error.message || 'Произошла ошибка');
        setIsLoading(false); // Останавливаем загрузку даже при ошибке
      }
    };

    initializeUser();
  }, []);

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
