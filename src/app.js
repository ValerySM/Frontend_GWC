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
        const success = await UniverseData.initFromServer();
        if (success) {
          console.log("Data loaded successfully. Total clicks:", UniverseData.getTotalClicks());
          setIsLoading(false);
        } else {
          console.error("Failed to load data");
          setIsError(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setIsError(true);
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