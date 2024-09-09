import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

const BACKEND_URL = 'https://backend-gwc-1.onrender.com';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setError('No token provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/user`, {
          headers: {
            'Authorization': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        if (data.success) {
          UniverseData.setUserData(data.telegram_id, data.username);
          UniverseData.setTotalClicks(data.totalClicks);
          UniverseData.setCurrentUniverse(data.currentUniverse);
          UniverseData.universes = data.universes;
          console.log('User data set:', UniverseData);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [location]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <UniverseSwitcher currentUniverse={UniverseData.currentUniverse} setCurrentUniverse={(universe) => {
        UniverseData.setCurrentUniverse(universe);
      }} />
      <Switch>
        <Route exact path="/" render={() => {
          switch(UniverseData.currentUniverse) {
            case 'EatsApp':
              return <EatsApp />;
            case 'First':
              return <EWE />;
            case 'EcoGame':
              return <EcoGame />;
            default:
              return <EatsApp />;
          }
        }} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <Router basename="/Frontend_GWC">
      <AppContent />
    </Router>
  );
}

export default App;