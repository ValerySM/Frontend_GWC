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
import UniverseData from './UniverseData';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    async function initializeData() {
      try {
        const userData = await UniverseData.getUserData();
        setGameState(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при инициализации данных:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setIsLoading(false);
      }
    }

    initializeData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (gameState.energy < gameState.energyMax) {
        const newEnergy = Math.min(gameState.energy + gameState.regenRate, gameState.energyMax);
        try {
          const updatedData = await UniverseData.setEnergy(newEnergy);
          setGameState(prev => ({ ...prev, ...updatedData }));
        } catch (error) {
          console.error('Ошибка при обновлении энергии:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.energy, gameState.energyMax, gameState.regenRate]);

  const handleClick = useCallback(async (e) => {
    e.preventDefault();
    setIsImageDistorted(true);

    try {
      const updatedData = await UniverseData.incrementTotalClicks(gameState.damageLevel);
      const newEnergy = Math.max(gameState.energy - 10, 0);
      const energyUpdateData = await UniverseData.setEnergy(newEnergy);

      setGameState(prev => ({
        ...prev,
        ...updatedData,
        ...energyUpdateData,
      }));

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

    } catch (error) {
      console.error('Ошибка при обработке клика:', error);
      setError('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
    }

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [gameState.damageLevel, gameState.energy]);

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
        const updatedData = await UniverseData.upgradeAttribute(type, cost);
        setGameState(prev => ({
          ...prev,
          ...updatedData,
        }));
      }
    } catch (error) {
      console.error(`Ошибка при улучшении ${type}:`, error);
      setError('Не удалось выполнить улучшение. Пожалуйста, попробуйте позже.');
    }
  };

  if (isLoading) {
    return <div>Загрузка данных...</div>;
  }

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
             ref={clickerRef}
             onClick={handleClick}
             onTouchStart={handleClick}>
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