import React from 'react';
import './EcoGame.css'; // Путь к CSS

const EcoGame = () => {
  return (
    <div className='contain'>
      <div className='lines'>
        <div className='line'></div>
        <div className='line'></div>
        <div className='line'></div>
      </div>
      <div className='neon-glow-l1'></div>
      <div className='neon-glow-l'></div>
      <div className='neon-glow-r1'></div>
      <div className='neon-glow-r'></div>
      <div className='content3'>Under development</div>
    </div>
  );
};

export default EcoGame;
