import React, { useState, useEffect } from 'react';
import UniverseData from './UniverseData';
import EatsApp from './EatsApp'; // Путь может отличаться

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initTelegramApp = async () => {
      console.log('Начало инициализации Telegram App');
      try {
        if (!window.Telegram || !window.Telegram.WebApp) {
          throw new Error('Telegram WebApp API не доступен');
        }

        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();

        const initData = tg.initDataUnsafe;
        if (!initData || !initData.user) {
          throw new Error('Данные пользователя недоступны');
        }

        const { id: telegramId, username, first_name } = initData.user;
        const displayName = username || first_name;

        console.log('Попытка инициализации с сервера', { telegramId, displayName });
        const success = await UniverseData.initFromServer(telegramId.toString(), displayName);
        
        if (success && UniverseData.isDataLoaded()) {
          console.log('Установленные данные:', {
            telegramId: UniverseData.getUserData().telegramId,
            username: UniverseData.getUserData().username,
            totalClicks: UniverseData.getTotalClicks(),
            currentUniverse: UniverseData.getCurrentUniverse()
          });

          await UniverseData.logToServer('Аутентификация успешна');

          tg.ready();
        } else {
          throw new Error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка во время инициализации:', error);
        await UniverseData.logToServer(`Ошибка инициализации: ${error.message}`);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegramApp();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Произошла ошибка: {error}</div>;
  }

  return <EatsApp />;
}

export default App;