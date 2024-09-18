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

const BACKEND_URL = 'https://backend-gwc.onrender.com';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ userData }) {
  const [totalClicks, setTotalClicks] = useState(userData.totalClicks);
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);

  const [energy, setEnergy] = useState(userData.energy);
  const [energyMax, setEnergyMax] = useState(userData.energyMax);
  const [regenRate, setRegenRate] = useState(userData.regenRate);
  const [damageLevel, setDamageLevel] = useState(userData.damageLevel);
  const [energyLevel, setEnergyLevel] = useState(userData.energyLevel);
  const [regenLevel, setRegenLevel] = useState(userData.regenLevel);

  const damageUpgradeCost = 1000 * Math.pow(2, damageLevel - 1);
  const energyUpgradeCost = 1000 * Math.pow(2, energyLevel - 1);
  const regenUpgradeCost = 50000 * Math.pow(2, regenLevel - 1);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  const sendUpdatesToServer = useCallback(async (updates) => {
    try {
      await fetch(`${BACKEND_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_id,
          updates: updates
        }),
      });
    } catch (error) {
      console.error('Error sending updates to server:', error);
    }
  }, [userData.user_id]);

  const handleClick = useCallback(() => {
    if (energy > 0) {
      const newTotalClicks = totalClicks + damageLevel;
      const newEnergy = Math.max(0, energy - 1);
      
      setTotalClicks(newTotalClicks);
      setEnergy(newEnergy);
      setCount(prevCount => prevCount + 1);
      
      sendUpdatesToServer({
        totalClicks: newTotalClicks,
        energy: newEnergy
      });
    }
  }, [damageLevel, energy, totalClicks, sendUpdatesToServer]);

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

  const handleDamageUpgrade = () => {
    if (totalClicks >= damageUpgradeCost) {
      const newDamageLevel = damageLevel + 1;
      const newTotalClicks = totalClicks - damageUpgradeCost;
      setDamageLevel(newDamageLevel);
      setTotalClicks(newTotalClicks);
      sendUpdatesToServer({
        damageLevel: newDamageLevel,
        totalClicks: newTotalClicks
      });
    }
  };

  const handleEnergyUpgrade = () => {
    if (totalClicks >= energyUpgradeCost) {
      const newEnergyLevel = energyLevel + 1;
      const newEnergyMax = energyMax + 100;
      const newTotalClicks = totalClicks - energyUpgradeCost;
      setEnergyLevel(newEnergyLevel);
      setEnergyMax(newEnergyMax);
      setTotalClicks(newTotalClicks);
      sendUpdatesToServer({
        energyLevel: newEnergyLevel,
        energyMax: newEnergyMax,
        totalClicks: newTotalClicks
      });
    }
  };

  const handleRegenUpgrade = () => {
    if (totalClicks >= regenUpgradeCost) {
      const newRegenLevel = regenLevel + 1;
      const newRegenRate = regenRate + 1;
      const newTotalClicks = totalClicks - regenUpgradeCost;
      setRegenLevel(newRegenLevel);
      setRegenRate(newRegenRate);
      setTotalClicks(newTotalClicks);
      sendUpdatesToServer({
        regenLevel: newRegenLevel,
        regenRate: newRegenRate,
        totalClicks: newTotalClicks
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prevEnergy => {
        if (prevEnergy < energyMax) {
          const newEnergy = Math.min(prevEnergy + regenRate, energyMax);
          sendUpdatesToServer({ energy: newEnergy });
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [energyMax, regenRate, sendUpdatesToServer]);

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
      damage: damageLevel
    };

    setDamageIndicators(prev => [...prev, newIndicator]);

    setTimeout(() => {
      setDamageIndicators(prev => prev.filter(indicator => indicator.id !== newIndicator.id));
    }, 1000);

    handleClick();

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [damageLevel, handleClick]);

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
    // Обработчик события закрытия приложения
    const handleClose = () => {
      sendUpdatesToServer({
        totalClicks,
        energy,
        energyMax,
        regenRate,
        damageLevel,
        energyLevel,
        regenLevel
      });
    };

    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.onEvent('viewportChanged', handleClose);
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.offEvent('viewportChanged', handleClose);
      }
    };
  }, [totalClicks, energy, energyMax, regenRate, damageLevel, energyLevel, regenLevel, sendUpdatesToServer]);

  const remainingEnergyPercentage = ((energyMax - energy) / energyMax) * 100;

  return (
    <div className="App">
      <header className="App-header">
        <SettingsButton isActive={activeTab !== null} />
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{totalClicks}</p>
        </div>
        <div className="energy-container">
          <p>Energy: {Math.floor(energy)}/{energyMax}</p>
        </div>
        <div className="clicker-container" ref={clickerRef}>
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
            {activeTab === 'UPGRADE' && (
              <UpgradeTab
                totalClicks={totalClicks}
                damageUpgradeCost={damageUpgradeCost}
                energyUpgradeCost={energyUpgradeCost}
                regenUpgradeCost={regenUpgradeCost}
                damageLevel={damageLevel}
                energyLevel={energyLevel}
                regenLevel={regenLevel}
                handleDamageUpgrade={handleDamageUpgrade}
                handleEnergyUpgrade={handleEnergyUpgrade}
                handleRegenUpgrade={handleRegenUpgrade}
              />
            )}
            {activeTab === 'BOOST' && <BoostTab />}
            {activeTab === 'TASKS' && <TasksTab />}
            {activeTab === 'SOON' && <SoonTab />}
          </div>
        )}
      </header>
    </div>
  );
}

export default EatsApp;