import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EatsApp.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import clickerImage from '../public/clicker-image.png';

const DamageIndicator = ({ x, y, damage }) => (
  <div className="damage-indicator" style={{ left: x, top: y }}>
    {damage}
  </div>
);

function EatsApp({ userData }) {
  console.log('Полученные данные пользователя в EatsApp:', userData);

  const [gameState, setGameState] = useState(userData);
  const [damageIndicators, setDamageIndicators] = useState([]);
  const clickerRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setGameState(userData); // Устанавливаем начальное состояние игры
    }
  }, [userData]);

  const handleInteraction = useCallback((e) => {
    e.preventDefault();
    const rect = clickerRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    const newIndicator = {
      id: Date.now() + Math.random(),
      x: x - rect.left,
      y: y - rect.top,
      damage: gameState.damageLevel
    };

    setDamageIndicators(prev => [...prev, newIndicator]);

    setTimeout(() => {
      setDamageIndicators(prev => prev.filter(indicator => indicator.id !== newIndicator.id));
    }, 1000);

    // Пример обновления состояния
    setGameState(prevState => ({
      ...prevState,
      totalClicks: prevState.totalClicks + prevState.damageLevel,
      energy: Math.max(prevState.energy - 10, 0)
    }));
  }, [gameState]);

  if (!gameState) {
    return <div>Загрузка состояния игры...</div>;
  }

  return (
    <div className="game-container">
      <div className="clicker-container" ref={clickerRef} onClick={handleInteraction}>
        <img src={clickerImage} alt="Clicker" className="clicker-image" />
        <p>Энергия: {gameState.energy} / {gameState.energyMax}</p>
        <p>Уровень урона: {gameState.damageLevel}</p>
        <p>Клики: {gameState.totalClicks}</p>

        {damageIndicators.map(indicator => (
          <DamageIndicator key={indicator.id} x={indicator.x} y={indicator.y} damage={indicator.damage} />
        ))}
      </div>
    </div>
  );
}

export default EatsApp;
