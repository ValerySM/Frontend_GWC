import React, { useState, useEffect } from 'react';
import Score from './comp/Score';
import './css/EWE.css';
import FarmButton from './comp/FarmButton';

function Ewe({ userId }) {
  const [tokens, setTokens] = useState(0);
  const [farmedTokens, setFarmedTokens] = useState(0);
  const [isFarming, setIsFarming] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedFarmingTime, setElapsedFarmingTime] = useState(0);
  const [animationClass, setAnimationClass] = useState('fade-in');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const texts = [
    // ... (оставьте массив texts без изменений)
  ];

  const maxTokens = 0.128;
  const farmingDuration = 12 * 60 * 60;

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    let farmingInterval;
    if (isFarming) {
      const interval = 1000;

      farmingInterval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.min((now - new Date(startTime)) / 1000 + elapsedFarmingTime, farmingDuration);
        const farmed = (elapsed / farmingDuration) * maxTokens;

        setFarmedTokens(farmed);
        setElapsedFarmingTime(elapsed);

        if (elapsed >= farmingDuration) {
          clearInterval(farmingInterval);
          setIsFarming(false);
          collectTokens();
        }
      }, interval);
    }

    return () => clearInterval(farmingInterval);
  }, [isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (isFarming) {
        updateServerData();
      }
    }, 60000); // Обновление каждую минуту

    return () => clearInterval(updateInterval);
  }, [isFarming, tokens, farmedTokens, startTime, elapsedFarmingTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      updateServerData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tokens, farmedTokens, isFarming, startTime, elapsedFarmingTime]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_user_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (response.ok) {
        const userData = await response.json();
        const offlineEarnings = calculateOfflineEarnings(userData.eweData);
        setTokens(userData.eweData.tokens + offlineEarnings);
        setFarmedTokens(userData.eweData.farmedTokens);
        setIsFarming(userData.eweData.isFarming);
        setStartTime(userData.eweData.startTime);
        setElapsedFarmingTime(userData.eweData.elapsedFarmingTime);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateServerData = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          updates: {
            eweData: {
              tokens: tokens,
              farmedTokens: farmedTokens,
              isFarming: isFarming,
              startTime: startTime,
              elapsedFarmingTime: elapsedFarmingTime
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update server data');
      }
    } catch (error) {
      console.error('Error updating server data:', error);
    }
  };

  const calculateOfflineEarnings = (eweData) => {
    if (!eweData.isFarming || !eweData.startTime) return 0;

    const now = new Date();
    const startTime = new Date(eweData.startTime);
    const elapsedTime = Math.min((now - startTime) / 1000 + eweData.elapsedFarmingTime, farmingDuration);
    return (elapsedTime / farmingDuration) * maxTokens;
  };

  const handleButtonClick = () => {
    if (!isFarming && farmedTokens >= maxTokens) {
      collectTokens();
    } else {
      startFarming();
    }
  };

  const startFarming = () => {
    if (!isFarming) {
      const now = new Date();
      setStartTime(now.toISOString());
      setIsFarming(true);
      setElapsedFarmingTime(0);
      setFarmedTokens(0);
      updateServerData();
    }
  };

  const collectTokens = () => {
    if (farmedTokens >= maxTokens) {
      setTokens(prevTokens => {
        const newTokens = Number((prevTokens + farmedTokens).toFixed(3));
        setFarmedTokens(0);
        setIsFarming(false);
        setElapsedFarmingTime(0);
        setStartTime(null);
        updateServerData();
        return newTokens;
      });
    }
  };

  // ... (оставьте функции handleNextText и handlePrevText без изменений)

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
        <div className={`animation_contain`}>
          <button onClick={handlePrevText} className='btntxt1 btntxt'>←</button>
          <div className={`text-display ${animationClass}`}>
            <h3>{texts[currentTextIndex].title}</h3><br />
            {texts[currentTextIndex].content}
          </div>
          <button onClick={handleNextText} className='btntxt2 btntxt'>→</button>
        </div>
        <FarmButton
          isFarming={isFarming}
          farmedTokens={farmedTokens}
          onClick={handleButtonClick}
        />
      </div>
    </div>
  );
}

export default Ewe;