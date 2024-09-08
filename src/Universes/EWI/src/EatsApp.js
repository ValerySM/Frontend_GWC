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

import {
  handleClick as handleClickFunction,
  handleDamageUpgrade as handleDamageUpgradeFunction,
  handleEnergyUpgrade as handleEnergyUpgradeFunction,
  handleRegenUpgrade as handleRegenUpgradeFunction
} from './scripts/functions';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ setIsTabOpen }) {
  console.log('EatsApp рендерится с данными:', UniverseData.getUserData(), UniverseData.getTotalClicks());
  const currentUniverse = UniverseData.getCurrentUniverse();

  const [totalClicks, setTotalClicks] = useState(UniverseData.getTotalClicks());
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);

  const [energy, setEnergy] = useState(() => 
    UniverseData.getUniverseData(currentUniverse, 'energy', 1000)
  );
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
    UniverseData.setUniverseData(currentUniverse, 'energyMax', energyMax);
  }, [energyMax, currentUniverse]);

  useEffect(() => {
    UniverseData.setUniverseData(currentUniverse, 'regenRate', regenRate);
  }, [regenRate, currentUniverse]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prevEnergy => {
        if (prevEnergy < energyMax) {
          const newEnergy = Math.min(prevEnergy + regenRate, energyMax);
          UniverseData.setUniverseData(currentUniverse, 'energy', newEnergy);
          return newEnergy;
        }
        return prevEnergy;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      UniverseData.setUniverseData(currentUniverse, 'energy', energy);
    };
  }, [energy, energyMax, regenRate, currentUniverse]);

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

  const updateTotalClicks = useCallback((additionalClicks) => {
    setTotalClicks(prevTotal => {
      const newTotal = prevTotal + additionalClicks;
      UniverseData.setTotalClicks(newTotal);
      return newTotal;
    });
  }, []);

  const handleClick = useCallback((e) => {
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

    handleClickFunction(energy, damageLevel, count, totalClicks, setCount, (newTotalClicks) => {
      updateTotalClicks(newTotalClicks);
      UniverseData.setTotalClicks(newTotalClicks);
      UniverseData.saveToServer();
    }, (newEnergy) => {
      setEnergy(newEnergy);
      UniverseData.setUniverseData(currentUniverse, { energy: newEnergy });
      UniverseData.saveToServer();
    }, setIsImageDistorted, activityTimeoutRef);

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
  }, [damageLevel, energy, count, totalClicks, updateTotalClicks, currentUniverse]);

  useEffect(() => {
    const clicker = clickerRef.current;
    if (clicker) {
      clicker.addEventListener('click', handleClick);
      clicker.addEventListener('touchstart', handleClick, { passive: false });
      
      return () => {
        clicker.removeEventListener('click', handleClick);
        clicker.removeEventListener('touchstart', handleClick);
      };
    }
  }, [handleClick]);

  const handleDamageUpgrade = () => {
    handleDamageUpgradeFunction(totalClicks, damageUpgradeCost, updateTotalClicks, (newLevel) => {
      setDamageLevel(newLevel);
      UniverseData.setUniverseData(currentU