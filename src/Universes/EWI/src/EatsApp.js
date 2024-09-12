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
  const [totalClicks, setTotalClicks] = useState(UniverseData.getTotalClicks());
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState(null);
  const [isImageDistorted, setIsImageDistorted] = useState(false);
  const [isTabOpenState, setIsTabOpenState] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [damageIndicators, setDamageIndicators] = useState([]);

  const [energy, setEnergy] = useState(() => 
    UniverseData.getUniverseData('energy', 1000)
  );
  const [energyMax, setEnergyMax] = useState(() => 
    UniverseData.getUniverseData('energyMax', 1000)
  );
  const [regenRate, setRegenRate] = useState(() => 
    UniverseData.getUniverseData('regenRate', 1)
  );
  const [damageLevel, setDamageLevel] = useState(() => 
    UniverseData.getUniverseData('damageLevel', 1)
  );
  const [energyLevel, setEnergyLevel] = useState(() => 
    UniverseData.getUniverseData('energyLevel', 1)
  );
  const [regenLevel, setRegenLevel] = useState(() => 
    UniverseData.getUniverseData('regenLevel', 1)
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
      
      const { telegramId, username } = UniverseData.getUserData();
      if (telegramId) {
        fetch('https://backend-gwc-1.onrender.com/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegram_id: telegramId,
            username: username,
            totalClicks: newTotalClicks,
            currentUniverse: UniverseData.getCurrentUniverse(),
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Данные успешно обновлены на сервере');
          } else {
            console.error('Ошибка при обновлении данных на сервере:', data.error);
          }
        })
        .catch(error => {
          console.error('Ошибка при отправке данных на сервер:', error);
        });
      } else {
        console.error('Telegram ID отсутствует');
      }
    });

    setTimeout(() => {
      setIsImageDistorted(false);
    }, 100);
  }, [damageLevel, energy, totalClicks, updateTotalClicks]);

  useEffect(() => {
    activityTimeoutRef.current = setTimeout(() => {
      console.log('EatsApp рендерится...');
    }, 3000);

    return () => {
      clearTimeout(activityTimeoutRef.current);
    };
  }, []);

  return (
    <div className="EatsApp">
      <div className="clicker-container">
        <div className="progressbar-container">
          <CircularProgressbar
            value={energy}
            maxValue={energyMax}
            text={`${Math.round(energy)} / ${energyMax}`}
            styles={buildStyles({
              pathColor: `rgba(62, 152, 199, ${energy / energyMax})`,
              textColor: '#000',
              trailColor: '#d6d6d6',
              backgroundColor: '#3e98c7',
            })}
          />
        </div>
        <img
          src={clickerImage}
          alt="Clicker"
          ref={clickerRef}
          onClick={handleClick}
          onTouchStart={handleClick}
          className={`clicker-image ${isImageDistorted ? 'distorted' : ''}`}
        />
        {damageIndicators.map((indicator) => (
          <DamageIndicator
            key={indicator.id}
            x={indicator.x}
            y={indicator.y}
            damage={indicator.damage}
          />
        ))}
      </div>

      {showButtons && (
        <div className="button-container">
          <button onClick={() => handleTabOpen('upgrades')}>Улучшения</button>
          <button onClick={() => handleTabOpen('boosts')}>Бусты</button>
          <button onClick={() => handleTabOpen('tasks')}>Задачи</button>
          <button onClick={() => handleTabOpen('soon')}>Скоро</button>
        </div>
      )}

      {isTabOpenState && (
        <div className="tab-content">
          <button onClick={handleBackButtonClick}>Назад</button>
          {activeTab === 'upgrades' && (
            <UpgradeTab
              damageLevel={damageLevel}
              energyLevel={energyLevel}
              regenLevel={regenLevel}
              damageUpgradeCost={damageUpgradeCost}
              energyUpgradeCost={energyUpgradeCost}
              regenUpgradeCost={regenUpgradeCost}
              handleDamageUpgrade={handleDamageUpgradeFunction}
              handleEnergyUpgrade={handleEnergyUpgradeFunction}
              handleRegenUpgrade={handleRegenUpgradeFunction}
            />
          )}
          {activeTab === 'boosts' && <BoostTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'soon' && <SoonTab />}
        </div>
      )}

      <SettingsButton />
    </div>
  );
}

export default EatsApp;
