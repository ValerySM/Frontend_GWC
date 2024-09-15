import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';

const BACKEND_URL = 'https://backend-gwc-1.onrender.com';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [telegramId, setTelegramId] = useState(null);
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  // Инициализация приложения и загрузка данных с сервера
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramIdParam = urlParams.get('telegram_id');
    const usernameParam = urlParams.get('username');
    if (telegramIdParam && usernameParam) {
      setTelegramId(telegramIdParam);
      setUsername(usernameParam);
      authenticateUser(telegramIdParam, usernameParam);
    } else {
      console.error('Данные пользователя недоступны');
      setIsLoading(false);
    }
  }, []);

  const authenticateUser = async (telegramId, username) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth`, { 
        telegram_id: telegramId, // должен соответствовать серверу
        username: username
      });
      console.log('Server response:', response.data); // Для отладки
      if (response.data.success) {
        setTotalClicks(response.data.totalClicks);
        setCurrentUniverse(response.data.currentUniverse || 'EatsApp');
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      setError('Не удалось загрузить данные пользователя');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление кликов на сервере
  const updateClicks = async (newClicks) => {
    setTotalClicks(newClicks);
    if (telegramId) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/update_clicks`, {
          telegram_id: telegramId, // должен соответствовать серверу
          totalClicks: newClicks,
          currentUniverse: currentUniverse,
          upgrades: {} // Вы можете реализовать логику обновления
        });
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to update clicks');
        }
      } catch (error) {
        console.error('Ошибка обновления кликов на сервере:', error);
        setError('Не удалось обновить количество кликов');
      }
    }
  };

  const handleClick = () => {
    const newCount = totalClicks + 1;
    updateClicks(newCount);
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <div>{error || 'Ошибка аутентификации. Пожалуйста, попробуйте снова.'}</div>;
  }

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-3xl mb-4">Счетчик: {totalClicks}</h1>
          <button
            onClick={handleClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Click
          </button>
        </div>
        <Switch>
          <Route exact path="/" render={() => {
            switch (currentUniverse) {
              case 'EatsApp':
                return <EatsApp totalClicks={totalClicks} updateClicks={updateClicks} />;
              case 'EWE':
                return <EWE />;
              case 'EcoGame':
                return <EcoGame />;
              default:
                return <EatsApp totalClicks={totalClicks} updateClicks={updateClicks} />;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
