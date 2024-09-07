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
          throw new Error('Telegram WebApp API не доступен');
        }

        const tg = window.Telegram.WebApp;
        
        // Ожидаем готовности WebApp
        await new Promise(resolve => {
          tg.onEvent('viewportChanged', resolve);
          tg.expand();
        });

        console.log('WebApp готов');

        // Получаем данные пользователя
        const initDataUnsafe = tg.initDataUnsafe || {};
        const initData = tg.initData ? JSON.parse(atob(tg.initData)) : {};
        const user = initDataUnsafe.user || initData.user;

        if (!user) {
          throw new Error('Данные пользователя недоступны');
        }

        const { id: telegramId, username, first_name } = user;
        const displayName = username || first_name;

        console.log('Получены данные пользователя:', { telegramId, displayName });

        const success = await UniverseData.initFromServer(telegramId.toString(), displayName);
        
        if (success && UniverseData.isDataLoaded()) {
          console.log('Установленные данные:', UniverseData.getUserData());
          setCurrentUniverse(UniverseData.getCurrentUniverse());
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

  useEffect(() => {
    const handleBackButton = () => {
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

  if (error) {
    return <div>Произошла ошибка: {error}</div>;
  }

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