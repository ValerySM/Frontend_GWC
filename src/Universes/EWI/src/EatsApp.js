import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './EatsApp.css';
import clickerImage from '../public/clicker-image.png';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function EatsApp({ userData }) {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const clickerRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setGameState(userData);
    }
  }, [userData]);

  const updateUserData = async (updates) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/update`, {
        user_id: userData.telegram_id,
        updates: updates
      });
      console.log('Состояние игры обновлено:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления состояния игры:', error);
      setError('Не удалось обновить состояние игры. Пожалуйста, попробуйте снова.');
      throw error;
    }
  };

  const handleInteraction = useCallback(async (e) => {
    if (!gameState) return;

    e.preventDefault();
    const rect = clickerRef.current.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    try {
      const newTotalClicks = gameState.totalClicks + gameState.damageLevel;
      const newEnergy = Math.max(gameState.energy - 10, 0);

      const updatedData = await updateUserData({
        totalClicks: newTotalClicks,
        energy: newEnergy
      });

      setGameState(updatedData);
    } catch (error) {
      console.error('Ошибка обновления состояния игры:', error);
      setError('Не удалось обновить состояние игры. Попробуйте снова.');
    }
  }, [gameState, userData]);

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!gameState) {
    return <div>Загрузка состояния игры...</div>;
  }

  return (
    <div className="game-container">
      <div className="clicker-container">
        <img
          className="clicker-image"
          ref={clickerRef}
          src={clickerImage}
          alt="Clicker"
          onClick={handleInteraction}
        />
      </div>
    </div>
  );
}

export default EatsApp;
