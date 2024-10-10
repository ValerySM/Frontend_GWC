import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EatsApp.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import UpgradeTab from './components/UpgradeTab';
import BoostTab from './components/BoostTab';
import TasksTab from './components/TasksTab';
import SettingsButton from './components/SettingsButton';
import clickerImage from '../public/clicker-image.png';
import SoonTab from './components/SoonTab';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ userId, setIsTabOpen }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/init_user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize user');
        }

        const userData = await response.json();
        console.log("Received user data:", userData);
        setUserData(userData);
      } catch (error) {
        console.error('Error initializing user:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      initUser();
    }
  }, [userId]);

  const updateUserData = async (updates) => {
    if (!userData) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const updatedData = await response.json();
      setUserData(prevData => ({ ...prevData, ...updatedData }));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleTabOpen = (tab) => {
    setActiveTab(tab);
    setIsTabOpenState(true);
    setIsTabOpen(true);
    setShowButtons(false);
  };

  const handleBackButtonClick = () => {
    setActiveTab(null);
    setIsTabOpenState(false);
    setIsTabOpen(false);
    setShowButtons(true);
  };

  const handleInteraction = useCallback((e) => {
    e.preventDefault();
    if (!userData) return;

    setIsImageDistorted(true);

    const rect = clickerRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    const newIndicator = {
      id: Date.now() + Math.random(),
      x: x - rect.left,
      y: y - rect.top,
      damage: userData.damageLevel
    };

    setDamageIndicators(prev => [...prev, newIndicator]);

    setTimeout(() => {
      setDamageIndicators(prev => prev.filter(indicator => indicator.id !== newIndicator.id));
    }, 1000);

    const newEnergy = Math.max(0, userData.energy - userData.damageLevel);
    const newTotalClicks = userData.totalClicks + userData.damageLevel;

    setUserData(prevData => ({
      ...prevData,
      energy: newEnergy,
      totalClicks: newTotalClicks
    }));

    updateUserData({ energy: newEnergy, totalClicks: newTotalClicks });

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [userData]);

  useEffect(() => {
    const clicker = clickerRef.current;
    if (clicker) {
      clicker.addEventListener('click', handleInteraction);
      clicker.addEventListener('touchstart', handleInteraction, { passive: false });
      
      return () => {
        clicker.removeEventListener('click', handleInteraction);
        clicker.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [handleInteraction]);

  useEffect(() => {
    if (!userData) return;

    const interval = setInterval(() => {
      setUserData(prevData => {
        if (prevData.energy < prevData.energyMax) {
          const newEnergy = Math.min(prevData.energy + prevData.regenRate, prevData.energyMax);
          updateUserData({ energy: newEnergy });
          return { ...prevData, energy: newEnergy };
        }
        return prevData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data available</div>;
  }

  const tabContent = (() => {
    switch (activeTab) {
      case 'UPGRADE':
        return (
          <UpgradeTab
            totalClicks={userData.totalClicks}
            damageUpgradeCost={1000 * Math.pow(2, userData.damageLevel - 1)}
            energyUpgradeCost={1000 * Math.pow(2, userData.energyLevel - 1)}
            regenUpgradeCost={50000 * Math.pow(2, userData.regenLevel - 1)}
            damageLevel={userData.damageLevel}
            energyLevel={userData.energyLevel}
            regenLevel={userData.regenLevel}
            handleDamageUpgrade={() => {
              const cost = 1000 * Math.pow(2, userData.damageLevel - 1);
              if (userData.totalClicks >= cost) {
                const newTotalClicks = userData.totalClicks - cost;
                const newDamageLevel = userData.damageLevel + 1;
                setUserData(prevData => ({
                  ...prevData,
                  totalClicks: newTotalClicks,
                  damageLevel: newDamageLevel
                }));
                updateUserData({ totalClicks: newTotalClicks, damageLevel: newDamageLevel });
              }
            }}
            handleEnergyUpgrade={() => {
              const cost = 1000 * Math.pow(2, userData.energyLevel - 1);
              if (userData.totalClicks >= cost) {
                const newTotalClicks = userData.totalClicks - cost;
                const newEnergyMax = userData.energyMax + 100;
                const newEnergyLevel = userData.energyLevel + 1;
                setUserData(prevData => ({
                  ...prevData,
                  totalClicks: newTotalClicks,
                  energyMax: newEnergyMax,
                  energyLevel: newEnergyLevel
                }));
                updateUserData({ totalClicks: newTotalClicks, energyMax: newEnergyMax, energyLevel: newEnergyLevel });
              }
            }}
            handleRegenUpgrade={() => {
              const cost = 50000 * Math.pow(2, userData.regenLevel - 1);
              if (userData.totalClicks >= cost) {
                const newTotalClicks = userData.totalClicks - cost;
                const newRegenRate = userData.regenRate + 1;
                const newRegenLevel = userData.regenLevel + 1;
                setUserData(prevData => ({
                  ...prevData,
                  totalClicks: newTotalClicks,
                  regenRate: newRegenRate,
                  regenLevel: newRegenLevel
                }));
                updateUserData({ totalClicks: newTotalClicks, regenRate: newRegenRate, regenLevel: newRegenLevel });
              }
            }}
          />
        );
      case 'BOOST':
        return <BoostTab updateUserData={updateUserData} />;
      case 'TASKS':
        return <TasksTab />;
      case 'SOON':
        return <SoonTab userData={userData} />;
      default:
        return null;
    }
  })();

  const remainingEnergyPercentage = ((userData.energyMax - userData.energy) / userData.energyMax) * 100;

  return (
    <div className="App">
      <header className="App-header">
        <SettingsButton isActive={activeTab !== null} />
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{userData.totalClicks}</p>
        </div>
        <div className="energy-container">
          <p>Energy: {Math.floor(userData.energy)}/{userData.energyMax}</p>
        </div>
        <div className="clicker-container" ref={clickerRef}>
          <img
            src={clickerImage}
            alt="Clicker"
            className={`clicker-image ${isImageDistorted ? 'distorted' : ''}`}
          />
          <div className="progress-circle" style={{ boxShadow: '0px 0px 10px 5px gray' }}>
            <CircularProgressbar
              value={remainingEnergyPercentage}
              maxValue={100}
              styles={buildStyles({
                pathColor: '#b20bff',
                textColor: '#fff',
                trailColor: '#07ffff',
                backgroundColor: '#07ffff',
              })}
            />
          </div>
          {damageIndicators.map(indicator => (
            <DamageIndicator
              key={indicator.id}
              x={indicator.x}
              y={indicator.y}
              damage={indicator.damage}
            />
          ))}
        </div>
        {showButtons && (
          <div className="tabs">
            <button
              className={activeTab === 'UPGRADE' ? 'active' : ''}
              onClick={() => handleTabOpen('UPGRADE')}
            >
              UPGRADE
            </button>
            <button
              className={activeTab === 'BOOST' ? 'active' : ''}
              onClick={() => handleTabOpen('BOOST')}
            >
              GAMES
            </button>
            <button
              className={activeTab === 'TASKS' ? 'active' : ''}
              onClick={() => handleTabOpen('TASKS')}
            >
              TASKS
            </button>
            <button
              className={activeTab === 'SOON' ? 'active' : ''}
              onClick={() => handleTabOpen('SOON')}
            >
              REF
            </button>
          </div>
        )}
        {isTabOpenState && (
          <div className={`tab-content ${isTabOpenState ? 'open' : ''}`}>
            <button className="back-button" onClick={handleBackButtonClick}>
              Back
            </button>
            {tabContent}
          </div>
        )}
      </header>
    </div>
  );
}

export default EatsApp;