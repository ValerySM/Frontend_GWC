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

import {
  handleClick,
  handleDamageUpgrade,
  handleEnergyUpgrade,
  handleRegenUpgrade
} from './scripts/functions';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ setIsTabOpen }) {
  const [userId, setUserId] = useState(null);
  const [totalClicks, setTotalClicks] = useState(0);
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
    console.log("Component mounted");
    console.log("User Agent:", navigator.userAgent);
    console.log("Platform:", navigator.platform);
    console.log("Window size:", window.innerWidth, "x", window.innerHeight);
    console.log("Telegram WebApp available:", !!window.Telegram?.WebApp);
    if (window.Telegram?.WebApp) {
      console.log("Telegram WebApp version:", window.Telegram.WebApp.version);
      console.log("Telegram WebApp platform:", window.Telegram.WebApp.platform);
    }

    let userData = null;

    // Try to get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    console.log("Encoded data from URL:", encodedData);

    if (encodedData) {
      try {
        userData = JSON.parse(decodeURIComponent(encodedData));
        console.log("Decoded user data from URL:", userData);
      } catch (error) {
        console.error("Error parsing URL data:", error);
      }
    } else {
      console.log("No data found in URL parameters");
    }

    // If no data from URL, try to get from Telegram WebApp
    if (!userData && window.Telegram && window.Telegram.WebApp) {
      console.log("Attempting to get data from Telegram WebApp");
      window.Telegram.WebApp.ready();
      const initData = window.Telegram.WebApp.initDataUnsafe;
      console.log("Init data from Telegram WebApp:", initData);
      if (initData && initData.user) {
        userData = {
          telegram_id: initData.user.id.toString(),
          // Add other fields if available in initData
        };
        console.log("Parsed user data from Telegram WebApp:", userData);
      }
    }

    if (userData) {
      console.log("Final user data:", userData);
      setUserId(userData.telegram_id);
      setTotalClicks(userData.totalClicks || 0);
      setEnergy(userData.energy || 1000);
      setEnergyMax(userData.energyMax || 1000);
      setRegenRate(userData.regenRate || 1);
      setDamageLevel(userData.damageLevel || 1);
      setEnergyLevel(userData.energyLevel || 1);
      setRegenLevel(userData.regenLevel || 1);
    } else {
      console.error("Failed to get user data from any source");
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      console.log("No userId available, skipping fetch");
      return;
    }

    console.log(`Fetching data for user ${userId}`);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/user/${userId}`;
      console.log("Fetch URL:", url);
      const response = await fetch(url);
      console.log(`Fetch response status: ${response.status}`);
      console.log("Response headers:", response.headers);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      if (response.ok) {
        const userData = JSON.parse(responseText);
        console.log("Received user data:", userData);
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
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

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

  const updateTotalClicks = (additionalClicks) => {
    const newTotal = totalClicks + additionalClicks;
    setTotalClicks(newTotal);
    updateUserData({ totalClicks: newTotal });
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

    handleClick(energy, damageLevel, count, totalClicks, setCount, updateTotalClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate);

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [damageLevel, energy, count, totalClicks]);

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
          updateUserData({ energy: newEnergy });
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      updateUserData({ energy });
    };
  }, [energy, energyMax, regenRate]);

  const tabContent = (() => {
    switch (activeTab) {
      case 'UPGRADE':
        return (
          <UpgradeTab
            totalClicks={totalClicks}
            damageUpgradeCost={damageUpgradeCost}
            energyUpgradeCost={energyUpgradeCost}
            regenUpgradeCost={regenUpgradeCost}
            damageLevel={damageLevel}
            energyLevel={energyLevel}
            regenLevel={regenLevel}
            handleDamageUpgrade={() => {
              if (totalClicks >= damageUpgradeCost) {
                updateTotalClicks(-damageUpgradeCost);
                const newDamageLevel = damageLevel + 1;
                setDamageLevel(newDamageLevel);
                updateUserData({ damageLevel: newDamageLevel });
              }
            }}
            handleEnergyUpgrade={() => {
              if (totalClicks >= energyUpgradeCost) {
                updateTotalClicks(-energyUpgradeCost);
                const newEnergyMax = energyMax + 100;
                const newEnergyLevel = energyLevel + 1;
                setEnergyMax(newEnergyMax);
                setEnergyLevel(newEnergyLevel);
                updateUserData({ energyMax: newEnergyMax, energyLevel: newEnergyLevel });
              }
            }}
            handleRegenUpgrade={() => {
              if (totalClicks >= regenUpgradeCost) {
                updateTotalClicks(-regenUpgradeCost);
                const newRegenRate = regenRate + 1;
                const newRegenLevel = regenLevel + 1;
                setRegenRate(newRegenRate);
                setRegenLevel(newRegenLevel);
                updateUserData({ regenRate: newRegenRate, regenLevel: newRegenLevel });
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
          <p>{totalClicks}</p>
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