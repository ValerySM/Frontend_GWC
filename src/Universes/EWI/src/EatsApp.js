import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './EatsApp.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import UpgradeTab from './components/UpgradeTab';
import BoostTab from './components/BoostTab';
import TasksTab from './components/TasksTab';
import SettingsButton from './components/SettingsButton';
import clickerImage from '../public/clicker-image.png';
import SoonTab from './components/SoonTab';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ userData }) {
  console.log('EatsApp received userData:', userData);

  const [gameState, setGameState] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);
  const [error, setError] = useState(null);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    if (userData) {
      console.log('Initializing gameState with userData:', userData);
      setGameState(userData);
    }
  }, [userData]);

  const updateUserData = async (updates) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/update`, {
        user_id: userData.telegram_id,
        updates: updates
      });
      console.log('Game state updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  };

  const handleInteraction = useCallback(async (e) => {
    if (!userData || !userData.telegram_id) {
      console.error('No user data or telegram_id found!');
      return;
    }

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

    try {
      const newTotalClicks = gameState.totalClicks + gameState.damageLevel;
      const newEnergy = Math.max(gameState.energy - 10, 0);

      const updatedData = await updateUserData({
        totalClicks: newTotalClicks,
        energy: newEnergy
      });

      setGameState(updatedData);
    } catch (error) {
      console.error('Error updating game state:', error);
      setError('Failed to update game state. Please try again.');
    }

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [gameState, userData]);

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

  const handleUpgrade = async (type) => {
    if (!userData || !userData.telegram_id) {
      console.error('No user data or telegram_id found for upgrade!');
      return;
    }

    try {
      let cost;
      switch (type) {
        case 'damage':
          cost = 1000 * Math.pow(2, gameState.damageLevel - 1);
          break;
        case 'energy':
          cost = 1000 * Math.pow(2, gameState.energyLevel - 1);
          break;
        case 'regen':
          cost = 50000 * Math.pow(2, gameState.regenLevel - 1);
          break;
        default:
          throw new Error('Unknown upgrade type');
      }

      if (gameState.totalClicks >= cost) {
        const updatedData = await updateUserData({
          [`${type}Level`]: gameState[`${type}Level`] + 1,
          totalClicks: gameState.totalClicks - cost
        });
        setGameState(updatedData);
      }
    } catch (error) {
      console.error(`Error upgrading ${type}:`, error);
      setError('Failed to upgrade. Please try again later.');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!gameState) {
    return <div>Loading game state...</div>;
  }

  const tabContent = (() => {
    switch (activeTab) {
      case 'UPGRADE':
        return (
          <UpgradeTab
            totalClicks={gameState.totalClicks}
            damageLevel={gameState.damageLevel}
            energyLevel={gameState.energyLevel}
            regenLevel={gameState.regenLevel}
            handleUpgrade={handleUpgrade}
            handleBackButtonClick={handleBackButtonClick}
          />
        );
      case 'BOOST':
        return <BoostTab />;
      case 'TASKS':
        return <TasksTab />;
      case 'SETTINGS':
        return <SoonTab />;
      default:
        return null;
    }
  })();

  return (
    <div className="game-container">
      <div className="main-tab">{tabContent}</div>
      <div className="clicker-container">
        <img
          className={`clicker-image ${isImageDistorted ? 'distorted' : ''}`}
          ref={clickerRef}
          src={clickerImage}
          alt="Clicker"
        />
        {damageIndicators.map((indicator) => (
          <DamageIndicator key={indicator.id} {...indicator} />
        ))}
      </div>

      <div className={`game-footer ${showButtons ? 'visible' : ''}`}>
        <div className="footer-buttons">
          <button onClick={() => handleTabOpen('UPGRADE')}>Upgrade</button>
          <button onClick={() => handleTabOpen('BOOST')}>Boost</button>
          <button onClick={() => handleTabOpen('TASKS')}>Tasks</button>
          <SettingsButton handleTabOpen={handleTabOpen} />
        </div>
      </div>
    </div>
  );
}

export default EatsApp;