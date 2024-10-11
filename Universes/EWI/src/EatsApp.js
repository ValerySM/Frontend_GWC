import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EatsApp.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import UpgradeTab from './components/UpgradeTab';
import BoostTab from './components/BoostTab';
import TasksTab from './components/TasksTab';
// import SettingsButton from './components/SettingsButton';
import clickerImage from '../public/clicker-image.png'
import SoonTab from './components/SoonTab'
import UniverseData from './UniverseData';
import 'css-doodle';
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
  const currentUniverse = UniverseData.getCurrentUniverse();

  const [totalClicks, setTotalClicks] = useState(UniverseData.getTotalClicks());
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);

  const [energy, setEnergy] = useState(() => {
    const savedEnergy = UniverseData.getUniverseData(currentUniverse, 'energy', 1000);
    const lastUpdate = UniverseData.getUniverseData(currentUniverse, 'lastUpdate', Date.now());
    const energyMax = UniverseData.getUniverseData(currentUniverse, 'energyMax', 1000);
    const regenRate = UniverseData.getUniverseData(currentUniverse, 'regenRate', 1);

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
    const regenAmount = Math.min(elapsedSeconds * regenRate, energyMax - savedEnergy);
    
    return Math.min(savedEnergy + regenAmount, energyMax);
  });

  const [energyMax, setEnergyMax] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'energyMax', 1000)
  );
  const [regenRate, setRegenRate] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'regenRate', 1)
  );

  const [damageLevel, setDamageLevel] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'damageLevel', 1)
  );
  const [energyLevel, setEnergyLevel] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'energyLevel', 1)
  );
  const [regenLevel, setRegenLevel] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'regenLevel', 1)
  );

  const damageUpgradeCost = 1000 * Math.pow(2, damageLevel - 1);
  const energyUpgradeCost = 1000 * Math.pow(2, energyLevel - 1);
  const regenUpgradeCost = 50000 * Math.pow(2, regenLevel - 1);

  const activityTimeoutRef = useRef(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    const updateTotalClicks = (newTotal) => {
      setTotalClicks(newTotal);
    };

    UniverseData.addListener(updateTotalClicks);

    return () => {
      UniverseData.removeListener(updateTotalClicks);
    };
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('universeData');
    if (!savedData) {
      UniverseData.resetToDefaults();
      setTotalClicks(100000);
      setEnergy(1000);
      setEnergyMax(1000);
      setRegenRate(1);
      setDamageLevel(1);
      setEnergyLevel(1);
      setRegenLevel(1);
    }
  }, []);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'energy', energy);
  }, [energy, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'energyMax', energyMax);
  }, [energyMax, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'regenRate', regenRate);
  }, [regenRate, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'damageLevel', damageLevel);
  }, [damageLevel, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'energyLevel', energyLevel);
  }, [energyLevel, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'regenLevel', regenLevel);
  }, [regenLevel, currentUniverse]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prevEnergy => {
        if (prevEnergy < energyMax) {
          const newEnergy = Math.min(prevEnergy + regenRate, energyMax);
          UniverseData.setUniverseData(currentUniverse, 'energy', newEnergy);
          UniverseData.setUniverseData(currentUniverse, 'lastUpdate', Date.now());
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      UniverseData.setUniverseData(currentUniverse, 'energy', energy);
      UniverseData.setUniverseData(currentUniverse, 'lastUpdate', Date.now());
    };
  }, [currentUniverse, energy, energyMax, regenRate]);

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

  const updateTotalClicks = (additionalClicks) => {
    setTotalClicks(prevTotal => {
      const newTotal = prevTotal + additionalClicks;
      UniverseData.setTotalClicks(newTotal);
      return newTotal;
    });
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
            handleDamageUpgrade={() => handleDamageUpgrade(totalClicks, damageUpgradeCost, updateTotalClicks, setDamageLevel, damageLevel)}
            handleEnergyUpgrade={() => handleEnergyUpgrade(totalClicks, energyUpgradeCost, updateTotalClicks, setEnergyMax, setEnergyLevel, energyMax, energyLevel)}
            handleRegenUpgrade={() => handleRegenUpgrade(totalClicks, regenUpgradeCost, updateTotalClicks, setRegenRate, setRegenLevel, regenRate, regenLevel)}
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


    <div className={`App `}>
      
      <header className="App-header">
        {/* <SettingsButton isActive={activeTab !== null} />  */}
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
            {/* <button className={activeTab === 'TASKS' ? 'active' : ''} onClick={() => handleTabOpen('TASKS')}>
              TASKS
            </button> */}
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