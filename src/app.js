import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/app.css'; 
import EatsApp from './Universes/EWI/EatsApp';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function App() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready(); 
        tg.expand();

        console.log('Telegram WebApp инициализирован');

        const initData = tg.initDataUnsafe;
        console.log('Данные из Telegram:', initData);

        if (initData && initData.user) {
          const userIdFromTg = initData.user.id.toString();
          console.log('ID пользователя из Telegram:', userIdFromTg);

          const response = await axios.post(`${BACKEND_URL}/auth`, { user_id: userIdFromTg });
          console.log('Ответ от бэкенда:', response.data);

          if (!response.data || !response.data.telegram_id) {
            throw new Error('Неверные данные от сервера');
          }

          setUserData(response.data); 
        } else {
          throw new Error('Данные пользователя не найдены в Telegram WebApp');
        }
      } catch (err) {
        console.error('Ошибка инициализации пользователя:', err);
        setError(err.message || 'Произошла ошибка при инициализации данных пользователя');
      } finally {
        setIsLoading(false);
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

  console.log('Данные пользователя перед передачей в EatsApp:', userData);

  return (
    <div className="App">
      <EatsApp userData={userData} />
    </div>
  );
}

export default App;
