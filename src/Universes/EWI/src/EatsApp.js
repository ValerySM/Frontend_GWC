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
import UniverseData from './UniverseData';

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
    const savedEnergy = UniverseData.getUpgradeLevel('energy') || 1000;
    const lastUpdate = Date.now();
    const energyMax = UniverseData.getUpgradeLevel('energyMax') || 1000;
    const regenRate = UniverseData.getUpgradeLevel('regenRate') || 1;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
    const regenAmount = Math.min(elapsedSeconds * regenRate, energyMax - savedEnergy);
    
    return Math.min(savedEnergy + regenAmount, energyMax);
  });

  const [energyMax, setEnergyMax] = useState(() => 
    UniverseData.getUpgradeLevel('energyMax') || 1000
  );
  const [regenRate, setRegenRate] = useState(() => 
    UniverseData.getUpgradeLevel('regenRate') || 1
  );

  const [damageLevel, setDamageLevel] = useState(() => 
    UniverseData.getUpgradeLevel('damageLevel')
  );
  const [energyLevel, setEnergyLevel] = useState(() => 
    UniverseData.getUpgradeLevel('energyLevel')
  );
  const [regenLevel, setRegenLevel] = useState(() => 
    UniverseData.getUpgradeLevel('regenLevel')
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
    UniverseData.setUpgradeLevel('energyMax', energyMax);
  }, [energyMax]);

  useEffect(() => {
    UniverseData.setUpgradeLevel('regenRate', regenRate);
  }, [regenRate]);

  useEffect(() => {
    UniverseData.setUpgradeLevel('damageLevel', damageLevel);
  }, [damageLevel]);

  useEffect(() => {
    UniverseData.setUpgradeLevel('energyLevel', energyLevel);
  }, [energyLevel]);

  useEffect(() => {
    UniverseData.setUpgradeLevel('regenLevel', regenLevel);
  }, [regenLevel]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prevEnergy => {
        if (prevEnergy < energyMax) {
          const newEnergy = Math.min(prevEnergy + regenRate, energyMax);
          UniverseData.setUpgradeLevel('energy', newEnergy);
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      UniverseData.setUpgradeLevel('energy', energy);
    };
  }, [energy, energyMax, regenRate]);

  // Обновленный эффект для автосохранения
  useEffect(() => {
    const saveInterval = setInterval(() => {
      UniverseData.saveToServer();
    }, 10000); // Сохранение каждые 10 секунд

    const handleBeforeUnload = () => {
      UniverseData.saveToServer();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
    <div className={`App`}>
      <header className="App-header">
       <div className='bg'>
       <div className="abg-wr-4">
    
    <ul className="abg-4">
        <li></li>
        <li></li>
        <li></li>
    </ul>
</div>
       </div>
        
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
                pathColor: 'rgba(188, 1, 1)',
                textColor: '#fff',
                trailColor: 'greenyellow',
                backgroundColor: '#3c98c7',
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