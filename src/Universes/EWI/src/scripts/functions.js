// import UniverseData from '../UniverseData';

export const handleClick = (energy, damageLevel, count, totalClicks, setCount, updateTotalClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate) => {
  if (energy > 0 && !isNaN(damageLevel)) {
    const damage = damageLevel;
    setCount(prevCount => prevCount + 1);
    updateTotalClicks(damage);
    setEnergy(prevEnergy => Math.max(prevEnergy - 1, 0));
    setIsImageDistorted(true);
    clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = setTimeout(() => {
      setIsImageDistorted(false);
    }, 200);
    if (energy === 1) {
      setRegenRate(1);
    }
  }
};

export const handleDamageUpgrade = (totalClicks, damageUpgradeCost, updateTotalClicks, setDamageLevel, damageLevel) => {
  if (totalClicks >= damageUpgradeCost) {
    updateTotalClicks(-damageUpgradeCost);
    setDamageLevel(prevLevel => {
      const newLevel = prevLevel + 1;
      console.log(`Damage level upgraded: ${prevLevel} -> ${newLevel}`);
      return newLevel;
    });
  } else {
    console.log(`Not enough clicks for upgrade. Current: ${totalClicks}, Required: ${damageUpgradeCost}`);
  }
};

export const handleEnergyUpgrade = (totalClicks, energyUpgradeCost, updateTotalClicks, setEnergyMax, setEnergyLevel, energyMax, energyLevel) => {
  if (totalClicks >= energyUpgradeCost) {
    updateTotalClicks(-energyUpgradeCost);
    setEnergyMax(prevMax => {
      const newMax = prevMax + 500;
      console.log(`Energy max upgraded: ${prevMax} -> ${newMax}`);
      return newMax;
    });
    setEnergyLevel(prevLevel => {
      const newLevel = prevLevel + 1;
      console.log(`Energy level upgraded: ${prevLevel} -> ${newLevel}`);
      return newLevel;
    });
  } else {
    console.log(`Not enough clicks for upgrade. Current: ${totalClicks}, Required: ${energyUpgradeCost}`);
  }
};

export const handleRegenUpgrade = (totalClicks, regenUpgradeCost, updateTotalClicks, setRegenRate, setRegenLevel, regenRate, regenLevel) => {
  if (totalClicks >= regenUpgradeCost && regenLevel < 5) {
    updateTotalClicks(-regenUpgradeCost);
    setRegenRate(prevRate => {
      const newRate = prevRate + 1;
      console.log(`Regen rate upgraded: ${prevRate} -> ${newRate}`);
      return newRate;
    });
    setRegenLevel(prevLevel => {
      const newLevel = prevLevel + 1;
      console.log(`Regen level upgraded: ${prevLevel} -> ${newLevel}`);
      return newLevel;
    });
  } else if (regenLevel >= 5) {
    console.log('Max regen level reached');
  } else {
    console.log(`Not enough clicks for upgrade. Current: ${totalClicks}, Required: ${regenUpgradeCost}`);
  }
};

export const handleMouseDown = (setIsClicking) => {
  setIsClicking(true);
};

export const handleMouseUp = (setIsClicking, activityTimeoutRef, setIsImageDistorted, isClicking) => {
  setIsClicking(false);
  clearTimeout(activityTimeoutRef.current);
  activityTimeoutRef.current = setTimeout(() => {
    if (!isClicking) {
      setIsImageDistorted(false);
    }
  }, 2000);
};