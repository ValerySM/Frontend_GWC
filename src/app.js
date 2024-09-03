import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Navigate } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function App() {
  const [currentUniverse, setCurrentUniverse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticateUser = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        console.error('No authentication token provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://backend-gwc-1.onrender.com/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          UniverseData.loadFromServer(data.universe_data);
          UniverseData.setSessionToken(data.session_token);
          setCurrentUniverse(data.universe_data.currentUniverse || 'EatsApp');
          setIsAuthenticated(true);
        } else {
          console.error('Authentication failed');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }

      setIsLoading(false);
    };

    authenticateUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Authentication failed. Please try again via Telegram bot.</div>;
  }

  return (
    <Router>
      <div className="App">
        <UniverseSwitcher currentUniverse={currentUniverse} setCurrentUniverse={setCurrentUniverse} />
        <Switch>
          <Route exact path="/" render={() => {
            switch(currentUniverse) {
              case 'EatsApp':
                return <EatsApp />;
              case 'First':
                return <EWE />;
              case 'EcoGame':
                return <EcoGame />;
              default:
                return <Navigate to="/" />;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;