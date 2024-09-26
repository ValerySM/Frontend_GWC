import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EatsApp.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import UpgradeTab from './components/UpgradeTab';
import BoostTab from './components/BoostTab';
import TasksTab from './components/TasksTab';
import SettingsButton from './components/SettingsButton';
import clickerImage from '../public/clicker-image.png'
import SoonTab from './components/SoonTab'
import { debounce } from 'lodash';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ setIsTabOpen }) {
  const [userId, setUserId] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);
  const [pendingClicks, setPendingClicks] = useState(0);
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);
  const [energy, setEnergy] = useState(1000);
  const [energyMax, setEnergyMax] = useState(1000);
  const [regenRate, setRegenRate] = useState(1);
  const [damageLevel, setDamageLevel] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [regenLevel, setRegenLevel] = useState(1);

  const damageUpgradeCost = 1000 * Math.pow(2, damageLevel - 1);
  const energyUpgradeCost = 1000 * Math.pow(2, energyLevel - 1);
  const regenUpgradeCost = 50000 * Math.pow(2, regenLevel - 1);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('user_id');
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
    }
  }, []);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setTotalClicks(userData.totalClicks || 0);
        setEnergy(userData.energy || 1000);
        setEnergyMax(userData.energyMax || 1000);
        setRegenRate(userData.regenRate || 1);
        setDamageLevel(userData.damageLevel || 1);
        setEnergyLevel(userData.energyLevel || 1);
        setRegenLevel(userData.regenLevel || 1);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const updateUserData = async (updates) => {
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
  };

  const debouncedUpdateUserData = useCallback(
    debounce((updates) => updateUserData(updates), 5000),
    [userId]
  );

  const updateTotalClicks = useCallback((additionalClicks) => {
    setTotalClicks((prevTotal) => {
      const newTotal = prevTotal + additionalClicks;
      debouncedUpdateUserData({ totalClicks: newTotal });
      return newTotal;
    });
    setPendingClicks(0);
  }, [debouncedUpdateUserData]);

  const addPendingClicks = useCallback((clicks) => {
    setPendingClicks((prev) => prev + clicks);
  }, []);

  useEffect(() => {
    if (pendingClicks > 0) {
      updateTotalClicks(pendingClicks);
    }
  }, [pendingClicks, updateTotalClicks]);

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

  const handleClick = useCallback((energy, damageLevel, count, totalClicks, setCount, addPendingClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate) => {
    if (energy >= damageLevel) {
      setEnergy(prevEnergy => prevEnergy - damageLevel);
      addPendingClicks(damageLevel);
      setCount(prevCount => prevCount + damageLevel);
      setIsImageDistorted(true);
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      activityTimeoutRef.current = setTimeout(() => {
        setIsImageDistorted(false);
      }, 200);
    }
  }, []);

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

    handleClick(energy, damageLevel, count, totalClicks, setCount, addPendingClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate);

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [damageLevel, energy, count, totalClicks, addPendingClicks, handleClick]);

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
      setEnergy(prevEnergy => {
        if (prevEnergy < energyMax) {
          const newEnergy = Math.min(prevEnergy + regenRate, energyMax);
          debouncedUpdateUserData({ energy: newEnergy });
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      debouncedUpdateUserData({ energy });
    };
  }, [energy, energyMax, regenRate, debouncedUpdateUserData]);

  const tabContent = (() => {
    switch (activeTab) {
      case 'UPGRADE':
        return (
          <UpgradeTab
            totalClicks={totalClicks + pendingClicks}
            damageUpgradeCost={damageUpgradeCost}
            energyUpgradeCost={energyUpgradeCost}
            regenUpgradeCost={regenUpgradeCost}
            damageLevel={damageLevel}
            energyLevel={energyLevel}
            regenLevel={regenLevel}
            handleDamageUpgrade={() => {
              if (totalClicks + pendingClicks >= damageUpgradeCost) {
                updateTotalClicks(-damageUpgradeCost);
                const newDamageLevel = damageLevel + 1;
                setDamageLevel(newDamageLevel);
                debouncedUpdateUserData({ damageLevel: newDamageLevel });
              }
            }}
            handleEnergyUpgrade={() => {
              if (totalClicks + pendingClicks >= energyUpgradeCost) {
                updateTotalClicks(-energyUpgradeCost);
                const newEnergyMax = energyMax + 100;
                const newEnergyLevel = energyLevel + 1;
                setEnergyMax(newEnergyMax);
                setEnergyLevel(newEnergyLevel);
                debouncedUpdateUserData({ energyMax: newEnergyMax, energyLevel: newEnergyLevel });
              }
            }}
            handleRegenUpgrade={() => {
              if (totalClicks + pendingClicks >= regenUpgradeCost) {
                updateTotalClicks(-regenUpgradeCost);
                const newRegenRate = regenRate + 1;
                const newRegenLevel = regenLevel + 1;
                setRegenRate(newRegenRate);
                setRegenLevel(newRegenLevel);
                debouncedUpdateUserData({ regenRate: newRegenRate, regenLevel: newRegenLevel });
              }
            }}
          />
        );
      case 'BOOST':
        return <BoostTab updateTotalClicks={updateTotalClicks} />;
      case 'TASKS':
        return <TasksTab />;
      case 'SOON':
        return <SoonTab />;
      default:
        return null;
    }
  })();

  const remainingEnergyPercentage = ((energyMax - energy) / energyMax) * 100;

  return (
    <div className={`App`}>
      <header className="App-header">
        <SettingsButton isActive={activeTab !== null} /> 
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{totalClicks + pendingClicks}</p>
        </div>
        <div className="energy-container">
          <p>Energy: {Math.floor(energy)}/{energyMax}</p>
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