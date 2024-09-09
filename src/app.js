import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UniverseSwitcher from './components/UniverseSwitcher';
import EatsApp from './Universes/EWI/EatsApp';
import EWE from './Universes/EWE/EWE';
import EcoGame from './Universes/ECI/EcoGame';
import UniverseData from './UniverseData';

function AppContent() {
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        setStatus('Checking Telegram Web App...');
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          setStatus('Getting user data...');
          const userData = webApp.initDataUnsafe.user;
          if (userData) {
            setStatus('Initializing from Telegram...');
            const success = await UniverseData.initFromServer(userData.id.toString(), userData.username || userData.first_name);
            if (success) {
              setStatus('Initialization successful!');
            } else {
              throw new Error('Failed to initialize data');
            }
          } else {
            throw new Error('No user data available');
          }
        } else {
          throw new Error('Telegram Web App is not available');
        }
      } catch (err) {
        setError(err.message);
        setStatus('Error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <div style={{padding: '20px'}}>Loading... Status: {status}</div>;
  }

  if (error) {
    return (
      <div style={{padding: '20px', color: 'red'}}>
        Error: {error}
      </div>
    );
  }

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <div style={{padding: '10px', backgroundColor: '#f0f0f0'}}>
          Status: {status}
          <br />
          User: {UniverseData.username}
          <br />
          Total Clicks: {UniverseData.totalClicks}
          <br />
          Current Universe: {UniverseData.currentUniverse}
        </div>
        <UniverseSwitcher 
          currentUniverse={UniverseData.getCurrentUniverse()} 
          setCurrentUniverse={(universe) => UniverseData.setCurrentUniverse(universe)}
        />
        <Switch>
          <Route exact path="/" render={() => {
            switch(UniverseData.getCurrentUniverse()) {
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
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;