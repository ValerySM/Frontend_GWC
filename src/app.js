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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      console.log('Initializing App');
      
      if (UniverseData.init()) {
        console.log('UniverseData initialized successfully');
        try {
          const serverInitSuccess = await UniverseData.initFromServer();
          if (serverInitSuccess) {
            console.log('Data loaded from server successfully');
            setCurrentUniverse(UniverseData.getCurrentUniverse());
            setIsAuthenticated(true);
          } else {
            console.error('Failed to load data from server');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error during server initialization:', error);
          setIsAuthenticated(false);
        }
      } else {
        console.error('Failed to initialize UniverseData');
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <div>Ошибка аутентификации. Пожалуйста, попробуйте снова через Telegram бот.</div>;
  }

  return (
    <Router basename="/Frontend_GWC">
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
                return <EatsApp />;
            }
          }} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;