import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import EatsApp from './EatsApp';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function sendLog(message) {
  fetch(`${BACKEND_URL}/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  }).catch(error => console.error('Error sending log:', error));
}

function App() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      sendLog('Fetching user data');
      
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        sendLog('Telegram WebApp is ready');
      } else {
        sendLog('Telegram WebApp is not available');
      }

      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      
      if (!userId) {
        sendLog('No user ID provided');
        setError('No user ID provided. Please make sure you're opening this app from the Telegram bot.');
        setLoading(false);
        return;
      }

      try {
        sendLog(`Sending request to ${BACKEND_URL}/auth`);
        const response = await fetch(`${BACKEND_URL}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });

        sendLog(`Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        sendLog(`Received user data: ${JSON.stringify(data)}`);
        setUserData(data);
        setLoading(false);

        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.expand();
          sendLog('Expanded Telegram WebApp');
        }
      } catch (error) {
        sendLog(`Error fetching user data: ${error.message}`);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div style={{color: 'white', textAlign: 'center', padding: '20px'}}>{error}</div>;
  }

  if (!userData) {
    return <div style={{color: 'white', textAlign: 'center', padding: '20px'}}>Error: Unable to load user data</div>;
  }

  sendLog('Rendering EatsApp');
  return <EatsApp userData={userData} />;
}

export default App;