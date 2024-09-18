import React, { useState, useEffect } from 'react';
import Score from './comp/Score';
import './css/EWE.css';
import FarmButton from './comp/FarmButton';

function Ewe() {
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem('tokens');
    return savedTokens ? parseFloat(savedTokens) : 0;
  });

  const [farmedTokens, setFarmedTokens] = useState(() => {
    const savedFarmedTokens = localStorage.getItem('farmedTokens');
    return savedFarmedTokens ? parseFloat(savedFarmedTokens) : 0;
  });

  const [isFarming, setIsFarming] = useState(() => {
    const savedIsFarming = localStorage.getItem('isFarming');
    return savedIsFarming === 'true';
  });

  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem('startTime');
    return savedStartTime ? new Date(parseInt(savedStartTime, 10)) : null;
  });

  const [elapsedFarmingTime, setElapsedFarmingTime] = useState(() => {
    const savedElapsedFarmingTime = localStorage.getItem('elapsedFarmingTime');
    return savedElapsedFarmingTime ? parseFloat(savedElapsedFarmingTime) : 0;
  });

  const [animationClass, setAnimationClass] = useState('');

  const maxTokens = 32;
  const farmingDuration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  useEffect(() => {
    let farmingInterval;
    if (isFarming) {
      const interval = 1000; // Update every second

      farmingInterval = setInterval(() => {
        const now = new Date();
        const elapsed = (now - startTime) / 1000;
        const farmed = Math.min((elapsed + elapsedFarmingTime) * 0.001, maxTokens);
        setFarmedTokens(farmed);

        if (farmed >= maxTokens) {
          clearInterval(farmingInterval);
          setIsFarming(false);
          setElapsedFarmingTime(0);
        }
      }, interval);
    }

    return () => clearInterval(farmingInterval);
  }, [isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    localStorage.setItem('tokens', tokens);
    localStorage.setItem('farmedTokens', farmedTokens);
    localStorage.setItem('isFarming', isFarming);
    localStorage.setItem('startTime', startTime ? startTime.getTime() : null);
    localStorage.setItem('elapsedFarmingTime', elapsedFarmingTime);
  }, [tokens, farmedTokens, isFarming, startTime, elapsedFarmingTime]);

  const handleButtonClick = () => {
    if (isFarming) {
      // Do nothing if farming is in progress
    } else if (farmedTokens >= maxTokens) {
      collectTokens();
    } else {
      startFarming();
    }
    // Trigger animation
    setAnimationClass('animate');
  };

  const startFarming = () => {
    if (!isFarming) {
      const now = new Date();
      setStartTime(now);
      setIsFarming(true);
      setElapsedFarmingTime(0);
      setFarmedTokens(0);
    }
  };

  const collectTokens = () => {
    if (farmedTokens >= maxTokens) {
      setTokens(prevTokens => Number((prevTokens + farmedTokens).toFixed(3)));
      setFarmedTokens(0);
      setIsFarming(false);
      setElapsedFarmingTime(0);
    }
  };

  const progressPercentage = (farmedTokens / maxTokens) * 100;

  return (
    <div className="App">
      <header className="header">
        <Score tokens={tokens} />
      </header>
      <div className="content">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          >
            <span className="progress-text">{progressPercentage.toFixed(1)}%</span>
          </div>
        </div>
        <FarmButton
          isFarming={isFarming}
          farmedTokens={farmedTokens}
          onClick={handleButtonClick}
        />
      </div>
      <div className={`animation_contain ${animationClass}`}>
        <div className='anim_blocks'></div>
        <div className='anim_blocks'></div>
        <div className='anim_blocks'></div>
        <div className='anim_blocks'></div>
        <div className='anim_blocks'></div>
        <div className='anim_blocks'></div>
      </div>
    </div>
  );
}

export default Ewe;
