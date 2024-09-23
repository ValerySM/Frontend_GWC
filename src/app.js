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

        console.log('Telegram WebApp initialized');

        const initData = tg.initDataUnsafe;
        console.log('Init data from Telegram:', initData);

        if (initData && initData.user) {
          const userIdFromTg = initData.user.id.toString();
          console.log('User ID from Telegram:', userIdFromTg);
          
          const response = await axios.post(`${BACKEND_URL}/auth`, { user_id: userIdFromTg });
          console.log('Response from backend:', response.data);
          
          if (!response.data || !response.data.telegram_id) {
            throw new Error('Invalid data received from server');
          }
          
          setUserData(response.data);
        } else {
          throw new Error('User data not found in Telegram WebApp');
        }
      } catch (err) {
        console.error('Error initializing user:', err);
        setError(err.message || 'An error occurred while initializing user data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data available. Please try reloading the app.</div>;
  }

  console.log('User data before passing to EatsApp:', userData);

  return (
    <div className="App">
      <EatsApp userData={userData} />
    </div>
  );
}

export default App;