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
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    console.log('Telegram WebApp initialized');

    const initData = tg.initDataUnsafe;
    console.log('Init data from Telegram:', initData);

    if (initData && initData.user) {
      const userIdFromTg = initData.user.id.toString();
      console.log('User ID from Telegram:', userIdFromTg);
      
      axios.post(`${BACKEND_URL}/auth`, { user_id: userIdFromTg })
        .then(response => {
          console.log('Response from backend:', response.data);
          if (!response.data || !response.data.telegram_id) {
            throw new Error('Invalid data received from server');
          }
          setUserData(response.data); // Устанавливаем данные пользователя
          setIsLoading(false); // Убираем статус загрузки
        })
        .catch(err => {
          console.error('Error initializing user:', err);
          setError('Failed to initialize user data. Please try again.');
          setIsLoading(false);
        });
    } else {
      console.error('User data not found in Telegram WebApp');
      setError('User data not found in Telegram WebApp.');
      setIsLoading(false);
    }

    // Установка цветов интерфейса
    document.body.style.backgroundColor = tg.backgroundColor;
    document.body.style.color = tg.textColor;
  }, []);

  // Проверка на загрузку данных
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Проверка на ошибки
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      {userData ? <EatsApp userData={userData} /> : <div>No user data available</div>}
    </div>
  );
}

export default App;