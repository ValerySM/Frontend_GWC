import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import EatsApp from './Universes/EWI/EatsApp';
import UniverseData from './UniverseData';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Starting data initialization...");
        const startTime = Date.now();
        const success = await UniverseData.initFromServer();
        const elapsedTime = Date.now() - startTime;

        if (success) {
          console.log("Data loaded successfully. Total clicks:", UniverseData.getTotalClicks());
          // Обеспечиваем минимальное время отображения загрузочного экрана
          const remainingTime = Math.max(0, 2000 - elapsedTime);
          setTimeout(() => setIsLoading(false), remainingTime);
        } else {
          throw new Error("Failed to load data");
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div style={{fontSize: '24px', textAlign: 'center', marginTop: '50px'}}>Loading data...</div>;
  }

  if (isError) {
    return <div style={{fontSize: '24px', textAlign: 'center', marginTop: '50px'}}>Error loading data. Please try again later.</div>;
  }

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <Switch>
          <Route exact path="/" component={EatsApp} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;