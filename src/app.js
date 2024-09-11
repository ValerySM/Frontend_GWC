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
        const success = await UniverseData.initFromServer();
        if (success) {
          setIsLoading(false);
        } else {
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
    return <div>Loading data...</div>;
  }

  if (isError) {
    return <div>Error loading data. Please try again later.</div>;
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