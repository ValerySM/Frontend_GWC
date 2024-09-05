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
