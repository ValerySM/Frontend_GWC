import React, { useState, useEffect, useCallback } from 'react';
import './EatsApp.css';
import clickerImage from '../public/clicker-image.png';
import UniverseData from './UniverseData';

function EatsApp() {
  const [totalClicks, setTotalClicks] = useState(UniverseData.getTotalClicks());

  useEffect(() => {
    const updateTotalClicks = (newTotal) => {
      console.log('Updating total clicks:', newTotal);
      setTotalClicks(newTotal);
    };

    UniverseData.addListener(updateTotalClicks);

    return () => {
      UniverseData.removeListener(updateTotalClicks);
    };
  }, []);

  const handleClick = useCallback(() => {
    console.log('Click handled');
    const newTotalClicks = totalClicks + 1;
    console.log('New total clicks:', newTotalClicks);
    UniverseData.setTotalClicks(newTotalClicks);
    UniverseData.saveToServer();
  }, [totalClicks]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{totalClicks}</p>
        </div>
        <div className="clicker-container" onClick={handleClick}>
          <img src={clickerImage} alt="Clicker" className="clicker-image" />
        </div>
      </header>
    </div>
  );
}

export default EatsApp;