import React, { useState, useEffect, useCallback } from 'react';
import './EatsApp.css';
import clickerImage from '../public/clicker-image.png';
import UniverseData from './UniverseData';

function EatsApp() {
  const [totalClicks, setTotalClicks] = useState(UniverseData.getTotalClicks());

  useEffect(() => {
    console.log('EatsApp mounted. Initial total clicks:', UniverseData.getTotalClicks());
    const updateTotalClicks = (newTotal) => {
      console.log('Listener called. New total clicks:', newTotal);
      setTotalClicks(newTotal);
    };

    UniverseData.addListener(updateTotalClicks);

    return () => {
      UniverseData.removeListener(updateTotalClicks);
    };
  }, []);

  const handleClick = useCallback(async () => {
    console.log('Click handled. Current total clicks:', totalClicks);
    const newTotalClicks = totalClicks + 1;
    console.log('New total clicks:', newTotalClicks);
    UniverseData.setTotalClicks(newTotalClicks);
    try {
      await UniverseData.saveToServer();
      console.log('Save to server completed. Current UniverseData:', UniverseData.getTotalClicks());
    } catch (error) {
      console.error('Error saving to server:', error);
    }
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