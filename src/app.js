import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';

const BACKEND_URL = 'https://backend-gwc-1.onrender.com';

function App() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [currentUniverse, setCurrentUniverse] = useState('EatsApp');
  const [universes, setUniverses] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('user_id');
    const clicksParam = urlParams.get('clicks');

    if (userIdParam) {
      setUserId(userIdParam);
      setCount(parseInt(clicksParam) || 0);
      authenticateUser(userIdParam);
    }
  }, []);

  const authenticateUser = async (userId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth`, { user_id: userId });
      setCount(response.data.clicks);
    } catch (error) {
      console.error('Error authenticating user:', error);
      setError('Не удалось загрузить данные пользователя');
    }
  };

  const handleClick = async () => {
    const newCount = count + 1;
    setCount(newCount);

    if (userId) {
      try {
        const response = await axios.post(`${BACKEND_URL}/update_clicks`, {
          user_id: userId,
          clicks: newCount
        });
        if (response.data.success) {
          setCount(response.data.clicks);
        }
      } catch (error) {
        console.error('Error updating clicks:', error);
        setError('Не удалось обновить количество кликов');
      }
    }
  };

  const updateUniverseData = (universeName, data) => {
    setUniverses(prevUniverses => ({
      ...prevUniverses,
      [universeName]: { ...prevUniverses[universeName], ...data }
    }));
  };

  const getUniverseData = (universeName, key, defaultValue) => {
    return universes[universeName]?.[key] ?? defaultValue;
  };

  const logToServer = (message) => {
    axios.post(`${BACKEND_URL}/api/log`, { user_id: userId, message })
      .catch(error => console.error('Error logging to server:', error));
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-3xl mb-4">Счетчик: {count}</h1>
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
                return <EatsApp count={count} updateCount={setCount} updateUniverseData={updateUniverseData} getUniverseData={getUniverseData} logToServer={logToServer} />;
              case 'EWE':
                return <EWE count={count} updateCount={setCount} updateUniverseData={updateUniverseData} getUniverseData={getUniverseData} logToServer={logToServer} />;
              case 'EcoGame':
                return <EcoGame count={count} updateCount={setCount} updateUniverseData={updateUniverseData} getUniverseData={getUniverseData} logToServer={logToServer} />;
              default:
                return <EatsApp count={count} updateCount={setCount} updateUniverseData={updateUniverseData} getUniverseData={getUniverseData} logToServer={logToServer} />;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;