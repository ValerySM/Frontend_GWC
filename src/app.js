import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/app.css'; 
import EatsApp from './Universes/EWI/EatsApp';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function App() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const initData = tg.initDataUnsafe;
    if (initData && initData.user) {
      const userIdFromTg = initData.user.id.toString();
      
      axios.post(`${BACKEND_URL}/auth`, { user_id: userIdFromTg })
        .then(response => {
          console.log('User data from backend:', response.data);
          setUserData(response.data);
        })
        .catch(err => {
          console.error('Error initializing user:', err);
          setError('Failed to initialize user data. Please try again.');
        });
    } else {
      setError('User data not found in Telegram WebApp.');
    }

    document.body.style.backgroundColor = tg.backgroundColor;
    document.body.style.color = tg.textColor;
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <EatsApp userData={userData} />
    </div>
  );
}

export default App;