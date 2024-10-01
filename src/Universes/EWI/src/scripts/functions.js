export const handleClick = (energy, damageLevel, setCount, updateTotalClicks, setEnergy, setIsImageDistorted, activityTimeoutRef, setRegenRate) => {
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

export const handleDamageUpgrade = (totalClicks, damageUpgradeCost, updateTotalClicks, setDamageLevel) => {
  if (totalClicks >= damageUpgradeCost) {
    updateTotalClicks(-damageUpgradeCost);
    setDamageLevel(prevLevel => prevLevel + 1);
  }
};

export const handleEnergyUpgrade = (totalClicks, energyUpgradeCost, updateTotalClicks, setEnergyMax, setEnergyLevel) => {
  if (totalClicks >= energyUpgradeCost) {
    updateTotalClicks(-energyUpgradeCost);
    setEnergyMax(prevMax => prevMax + 500);
    setEnergyLevel(prevLevel => prevLevel + 1);
  }
};

export const handleRegenUpgrade = (totalClicks, regenUpgradeCost, updateTotalClicks, setRegenRate, setRegenLevel, regenLevel) => {
  if (totalClicks >= regenUpgradeCost && regenLevel < 5) {
    updateTotalClicks(-regenUpgradeCost);
    setRegenRate(prevRate => prevRate + 1);
    setRegenLevel(prevLevel => prevLevel + 1);
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