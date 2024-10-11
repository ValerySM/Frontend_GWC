// src/Upgrades.js
import React, { useState } from 'react';

function Upgrades({ upgrades, onPurchase }) {
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleClick = (index) => {
    if (upgrades[index].canPurchase) {
      setLoadingIndex(index);
      onPurchase(index);
      setTimeout(() => setLoadingIndex(null), 1000); // Сброс состояния загрузки через 1 секунду
    }
  };

  return (
    <div className="upgrades">
      <h2>Upgrades</h2>
      <ul>
        {upgrades.map((upgrade, index) => (
          <li key={index}>
            <button
              onClick={() => handleClick(index)}
              disabled={!upgrade.canPurchase}
              className={loadingIndex === index ? 'loading-active' : ''}
            >
              {upgrade.name} - {upgrade.cost} clicks
              <div className={`loading ${loadingIndex === index ? 'loading-active' : ''}`}></div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Upgrades;
