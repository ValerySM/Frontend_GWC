import React, { useState } from 'react';
import '../css.components/UpgradeTab.css'; // Импортируем стили для компонента

const UpgradeTab = ({ totalClicks, damageUpgradeCost, energyUpgradeCost, regenUpgradeCost, damageLevel, energyLevel, regenLevel, handleDamageUpgrade, handleEnergyUpgrade, handleRegenUpgrade }) => {
  const [buttonState, setButtonState] = useState({
    damage: '',
    energy: '',
    regen: '',
  });

  const handleUpgradeClick = (type) => {
    setButtonState((prevState) => ({
      ...prevState,
      [type]: 'onclic',
    }));

    setTimeout(() => {
      setButtonState((prevState) => ({
        ...prevState,
        [type]: 'validate',
      }));

      setTimeout(() => {
        setButtonState((prevState) => ({
          ...prevState,
          [type]: '',
        }));
      }, 1250);
    }, 2250);
  };

  return (
    <div className="upgrades">
      <button
        className={buttonState.damage}
        onClick={() => { handleUpgradeClick('damage'); handleDamageUpgrade(); }}
        disabled={totalClicks < damageUpgradeCost}
      >
        <h4 className="upgrade-txt">Ур. Урона {damageLevel}</h4>
        <p>+1 урона за клик</p>
        <p>Стоимость: {damageUpgradeCost} $EWE</p>
      </button>
      <button
        className={buttonState.energy}
        onClick={() => { handleUpgradeClick('energy'); handleEnergyUpgrade(); }}
        disabled={totalClicks < energyUpgradeCost}
      >
        <h4 className="upgrade-txt">Ур. Энергии {energyLevel}</h4>
        <p>+500 макс. энергии</p>
        <p>Стоимость: {energyUpgradeCost} $EWE</p>
      </button>
      {regenLevel < 5 && (
        <button
          className={buttonState.regen}
          onClick={() => { handleUpgradeClick('regen'); handleRegenUpgrade(); }}
          disabled={totalClicks < regenUpgradeCost}
        >
          <h4 className="upgrade-txt">Ур. Регенерации {regenLevel}</h4>
          <p>+1 скорость регенерации</p>
          <p>Стоимость: {regenUpgradeCost} $EWE</p>
        </button>
      )}
    </div>
  );
};

export default UpgradeTab;
