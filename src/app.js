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
  const [error, setError] = useState(null);

  useEffect(() => {
    const initTelegramApp = async () => {
      console.log('Начало инициализации Telegram App');
      try {
        if (!window.Telegram || !window.Telegram.WebApp) {
          console.error('Telegram WebApp API не доступен');
          throw new Error('Telegram WebApp API не доступен');
        }
        console.log('Telegram WebApp API доступен');

        const tg = window.Telegram.WebApp;
        
        console.log('Ожидание готовности WebApp...');
        await new Promise(resolve => {
          tg.onEvent('viewportChanged', () => {
            console.log('Событие viewportChanged получено');
            resolve();
          });
          tg.expand();
        });
        console.log('WebApp готов');

        // Получаем данные пользователя из URL
        const params = new URLSearchParams(window.location.search);
        const telegramId = params.get('telegram_id');
        const username = params.get('username');

        console.log('Параметры URL:', {
          telegramId: telegramId || 'отсутствует',
          username: username || 'отсутствует'
        });

        if (!telegramId || !username) {
          console.error('Данные пользователя недоступны в URL');
          throw new Error('Данные пользователя недоступны');
        }

        console.log('Получены данные пользователя из URL:', { telegramId, username });

        console.log('Инициализация данных с сервера...');
        const success = await UniverseData.initFromServer(telegramId.toString(), username);
        
        if (success && UniverseData.isDataLoaded()) {
          console.log('Данные успешно загружены с сервера');
          console.log('Установленные данные пользователя:', UniverseData.getUserData());
          const currentUniverse = UniverseData.getCurrentUniverse();
          console.log('Текущая вселенная:', currentUniverse);
          setCurrentUniverse(currentUniverse);
          await UniverseData.logToServer('Аутентификация успешна');
          console.log('Вызов tg.ready()');
          tg.ready();
        } else {
          console.error('Не удалось загрузить данные пользователя');
          throw new Error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка во время инициализации:', error);
        await UniverseData.logToServer(`Ошибка инициализации: ${error.message}`);
        setError(error.message);
      } finally {
        console.log('Инициализация завершена, isLoading установлен в false');
        setIsLoading(false);
      }
    };

    initTelegramApp();
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      console.log('Нажата кнопка "Назад"');
    };

    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Добавление обработчика для кнопки "Назад"');
      window.Telegram.WebApp.onEvent('backButtonClicked', handleBackButton);
    } else {
      console.warn('Telegram WebApp недоступен для добавления обработчика кнопки "Назад"');
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Удаление обработчика для кнопки "Назад"');
        window.Telegram.WebApp.offEvent('backButtonClicked', handleBackButton);
      }
    };
  }, []);

  if (isLoading) {
    console.log('Отображение экрана загрузки');
    return <div>Загрузка...</div>;
  }

  if (error) {
    console.log('Отображение экрана ошибки');
    return <div>Произошла ошибка: {error}</div>;
  }

  console.log('Рендеринг основного приложения');
  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <UniverseSwitcher currentUniverse={currentUniverse} setCurrentUniverse={setCurrentUniverse} />
        <Switch>
          <Route exact path="/" render={() => {
            console.log('Рендеринг вселенной:', currentUniverse);
            switch(currentUniverse) {
              case 'EatsApp':
                return <EatsApp />;
              case 'First':
                return <EWE />;
              case 'EcoGame':
                return <EcoGame />;
              default:
                console.log('Неизвестная вселенная:', currentUniverse);
                return <div>Неизвестная вселенная</div>;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;