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

  const requiredFields = ['telegram_id', 'totalClicks', 'energy', 'energyMax', 'damageLevel', 'energyLevel', 'regenLevel'];
  const missingFields = requiredFields.filter(field => !userData || userData[field] === undefined);

  if (missingFields.length > 0) {
    console.error('Missing fields in user data:', missingFields);
    return <div>Ошибка: Недостаточно данных пользователя. Отсутствуют поля: {missingFields.join(', ')}</div>;
  }

  const [gameState, setGameState] = useState(userData);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);
  const [error, setError] = useState(null);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    setGameState(userData);
  }, [userData]);

  const handleInteraction = useCallback(async (e) => {
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

      const response = await axios.post(`${BACKEND_URL}/update`, {
        user_id: userData.telegram_id,
        updates: {
          totalClicks: newTotalClicks,
          energy: newEnergy
        }
      });

      setGameState(response.data);
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
  }, [gameState, userData.telegram_id]);

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
          throw new Error('Неизвестный тип улучшения');
      }

      if (gameState.totalClicks >= cost) {
        const response = await axios.post(`${BACKEND_URL}/update`, {
          user_id: userData.telegram_id,
          updates: {
            [`${type}Level`]: gameState[`${type}Level`] + 1,
            totalClicks: gameState.totalClicks - cost
          }
        });
        setGameState(response.data);
      }
    } catch (error) {
      console.error(`Ошибка при улучшении ${type}:`, error);
      setError('Не удалось выполнить улучшение. Пожалуйста, попробуйте позже.');
    }
  };

  if (error) {
    return <div>Ошибка: {error}</div>;
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
            handleDamageUpgrade={() => handleUpgrade('damage')}
            handleEnergyUpgrade={() => handleUpgrade('energy')}
            handleRegenUpgrade={() => handleUpgrade('regen')}
          />
        );
      case 'BOOST':
        return <BoostTab />;
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
    <div className={`App`}>
      <header className="App-header">
        <SettingsButton isActive={activeTab !== null} /> 
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{gameState.totalClicks}</p>
        </div>
        <div className="energy-container">
          <p>Energy: {Math.floor(gameState.energy)}/{gameState.energyMax}</p>
        </div>
        <div className="clicker-container"
             ref={clickerRef}>
          <img src={clickerImage} alt="Clicker" className={`clicker-image ${isImageDistorted ? 'distorted' : ''}`} />
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
            <DamageIndicator key={indicator.id} x={indicator.x} y={indicator.y} damage={indicator.damage} />
          ))}
        </div>
        {showButtons && (
          <div className="tabs">
            <button className={activeTab === 'UPGRADE' ? 'active' : ''} onClick={() => handleTabOpen('UPGRADE')}>
              UPGRADE
            </button>
            <button className={activeTab === 'BOOST' ? 'active' : ''} onClick={() => handleTabOpen('BOOST')}>
              GAMES
            </button>
            <button className={activeTab === 'TASKS' ? 'active' : ''} onClick={() => handleTabOpen('TASKS')}>
              TASKS
            </button>
            <button className={activeTab === 'SOON' ? 'active' : ''} onClick={() => handleTabOpen('SOON')}>
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