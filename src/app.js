import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import EatsApp from './EatsApp';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function App() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Инициализация Telegram Web App
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
      }

      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id');
      
      if (!userId) {
        console.error('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);

        // Расширяем окно приложения на весь экран
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.expand();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userData) {
    return <div>Error: Unable to load user data</div>;
  }

  return <EatsApp userData={userData} />;
}

export default App;