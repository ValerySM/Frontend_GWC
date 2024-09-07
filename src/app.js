import React, { useState, useEffect } from 'react';
import UniverseData from './UniverseData';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    const initTelegramApp = async () => {
      console.log('Начало инициализации Telegram App');
      try {
        if (!window.Telegram || !window.Telegram.WebApp) {
          throw new Error('Telegram WebApp API не доступен');
        }

        const tg = window.Telegram.WebApp;
        tg.expand();

        const initData = tg.initDataUnsafe;
        console.log('Полученные данные initData:', JSON.stringify(initData));
        
        if (!initData || !initData.user) {
          throw new Error('Данные пользователя недоступны');
        }

        const { id: telegramId } = initData.user;

        console.log('Попытка инициализации с сервера', { telegramId });
        const success = await UniverseData.initFromServer(telegramId.toString());
        
        if (success && UniverseData.isDataLoaded()) {
          console.log('Установленные данные:', {
            telegramId: UniverseData.telegramId,
            totalClicks: UniverseData.totalClicks
          });

          setTotalClicks(UniverseData.getTotalClicks());
          tg.ready();
        } else {
          throw new Error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка во время инициализации:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegramApp();
  }, []);

  const handleClick = () => {
    const newTotalClicks = totalClicks + 1;
    setTotalClicks(newTotalClicks);
    UniverseData.setTotalClicks(newTotalClicks);
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Произошла ошибка: {error}</div>;
  }

  return (
    <div>
      <h1>Всего кликов: {totalClicks}</h1>
      <button onClick={handleClick}>Кликни меня!</button>
    </div>
  );
}

export default App;