import React, { useState } from 'react';
import PurblePairs from '../games/purble-game/PurblePairs';
import AppleCatcher from '../games/apple-game/AppleCatcher';
import '../css.components/BoostTab.css';

const BoostTab = () => {
  const [activeGame, setActiveGame] = useState(null);

  const handleVictory = () => {
    setActiveGame(null);
  };

  return (
    <div className="boost">
      {!activeGame ? (
        <div className="game-selection">
          <h3>Выберите мини-игру</h3>
          <button className='gameBTN' onClick={() => setActiveGame('PURBLE_PAIRS')}>Purble Pairs</button>
          <button className='gameBTN' onClick={() => setActiveGame('APPLE_CATCHER')}>Apple Catcher</button>
        </div>
      ) : (
        <div className="game-container">
          {activeGame === 'PURBLE_PAIRS' && <PurblePairs onVictory={handleVictory} />}
          {activeGame === 'APPLE_CATCHER' && <AppleCatcher onGameOver={handleVictory} />}
        </div>
      )}
    </div>
  );
};

export default BoostTab;