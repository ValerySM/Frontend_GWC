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

function EatsApp({ userId }) {
  const [gameState, setGameState] = useState({
    totalClicks: 0,
    energy: 1000,
    energyMax: 1000,
    regenRate: 1,
    damageLevel: 1,
    energyLevel: 1,
    regenLevel: 1,
  });
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);
  const unsavedChangesRef = useRef({});
  const saveTimeoutRef = useRef(null);
  const clickCountRef = useRef(0);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        console.log("Fetched user data:", userData); // Debugging log
        setGameState(prevState => ({
          ...prevState,
          totalClicks: userData.totalClicks || 0,
          energy: userData.energy || 1000,
          energyMax: userData.energyMax || 1000,
          regenRate: userData.regenRate || 1,
          damageLevel: userData.damageLevel || 1,
          energyLevel: userData.energyLevel || 1,
          regenLevel: userData.regenLevel || 1,
        }));
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const updateUserData = useCallback(async (updates) => {
    if (!userId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, updates }),
      });

      if (!response.ok) {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }, [userId]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updates = unsavedChangesRef.current;
      if (Object.keys(updates).length > 0) {
        updateUserData(updates);
        unsavedChangesRef.current = {};
      }
    }, 30000); // Save every 30 seconds if there are unsaved changes
  }, [updateUserData]);

  const updateGameState = useCallback((updates) => {
    setGameState(prevState => {
      const newState = { ...prevState, ...updates };
      Object.keys(updates).forEach(key => {
        unsavedChangesRef.current[key] = newState[key];
      });
      scheduleSave();
      return newState;
    });

    clickCountRef.current += 1;
    if (clickCountRef.current >= 50) { // Save after every 50 clicks
      updateUserData(unsavedChangesRef.current);
      unsavedChangesRef.current = {};
      clickCountRef.current = 0;
    }
  }, [scheduleSave, updateUserData]);

  const handleInteraction = useCallback((e) => {
    e.preventDefault();
    setIsImageDistorted(true);

    const rect = clickerRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    const newIndicator = {
      id: Date.now() + Math.random(),
      x: x - rect.left,
      y: y - rect.top,
      damage: gameState.damageLevel
    };

    setDamageIndicators(prev => [...prev, newIndicator]);

    setTimeout(() => {
      setDamageIndicators(prev => prev.filter(indicator => indicator.id !== newIndicator.id));
    }, 1000);

    const clickValue = gameState.damageLevel;
    updateGameState({
      totalClicks: gameState.totalClicks + clickValue,
      energy: Math.max(0, gameState.energy - 10)
    });

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [gameState, updateGameState]);

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
    const interval = setInterval(() => {
      updateGameState(prevState => ({
        energy: Math.min(prevState.energy + prevState.regenRate, prevState.energyMax)
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      // Final save when component unmounts
      updateUserData(unsavedChangesRef.current);
    };
  }, [updateGameState, updateUserData]);

  const handleTabOpen = (tab) => {
    setActiveTab(tab);
    setIsTabOpenState(true);
    setShowButtons(false);
  };

  const handleBackButtonClick = () => {
    setActiveTab(null);
    setIsTabOpenState(false);
    setShowButtons(true);
  };

  const damageUpgradeCost = 1000 * Math.pow(2, gameState.damageLevel - 1);
  const energyUpgradeCost = 1000 * Math.pow(2, gameState.energyLevel - 1);
  const regenUpgradeCost = 50000 * Math.pow(2, gameState.regenLevel - 1);

  const tabContent = (() => {
    switch (activeTab) {
      case 'UPGRADE':
        return (
          <UpgradeTab
            totalClicks={gameState.totalClicks}
            damageUpgradeCost={damageUpgradeCost}
            energyUpgradeCost={energyUpgradeCost}
            regenUpgradeCost={regenUpgradeCost}
            damageLevel={gameState.damageLevel}
            energyLevel={gameState.energyLevel}
            regenLevel={gameState.regenLevel}
            handleDamageUpgrade={() => {
              if (gameState.totalClicks >= damageUpgradeCost) {
                updateGameState({
                  totalClicks: gameState.totalClicks - damageUpgradeCost,
                  damageLevel: gameState.damageLevel + 1
                });
              }
            }}
            handleEnergyUpgrade={() => {
              if (gameState.totalClicks >= energyUpgradeCost) {
                updateGameState({
                  totalClicks: gameState.totalClicks - energyUpgradeCost,
                  energyMax: gameState.energyMax + 100,
                  energyLevel: gameState.energyLevel + 1
                });
              }
            }}
            handleRegenUpgrade={() => {
              if (gameState.totalClicks >= regenUpgradeCost) {
                updateGameState({
                  totalClicks: gameState.totalClicks - regenUpgradeCost,
                  regenRate: gameState.regenRate + 1,
                  regenLevel: gameState.regenLevel + 1
                });
              }
            }}
          />
        );
      case 'BOOST':
        return <BoostTab updateGameState={updateGameState} />;
      case 'TASKS':
        return <TasksTab />;
      case 'SOON':
        return <SoonTab />;
      default:
        return null;
    }
  })();

  const remainingEnergyPercentage = ((gameState.energyMax - gameState.energy) / gameState.energyMax) * 100;

  return (
    <div className="App">
      <header className="App-header">
        <SettingsButton isActive={activeTab !== null} /> 
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{gameState.totalClicks}</p>
        </div>
        <div className="energy-container">
          <p>Energy: {Math.floor(gameState.energy)}/{gameState.energyMax}</p>
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
            <button className="back-button" onClick={handleBackButtonClick}>Back</button>
            {tabContent}
          </div>
        )}
      </header>
    </div>
  );
}

export default EatsApp;