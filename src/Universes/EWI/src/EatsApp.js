import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './EatsApp.css';

const BACKEND_URL = 'https://backend-gwc.onrender.com';

function EatsApp({ setIsTabOpen }) {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const clickerRef = useRef(null);

  // Получение данных с бэкенда
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready();
        const initData = tg.initDataUnsafe;

        if (initData && initData.user) {
          console.log('Получение данных с сервера для пользователя:', initData.user.id);

          // Запрос на получение данных с бэкенда
          const response = await axios.post(`${BACKEND_URL}/auth`, { user_id: initData.user.id.toString() });
          console.log('Данные с бэкенда:', response.data);

          // Устанавливаем состояние игры
          setGameState(response.data);
          setIsLoading(false);  // Завершаем состояние загрузки
        } else {
          throw new Error("Не удалось получить данные пользователя из Telegram");
        }
      } catch (error) {
        console.error("Ошибка получения данных:", error);
        setError("Не удалось загрузить данные игры");
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, []);

  // Обработчик кликов
  const handleInteraction = useCallback(() => {
    if (!gameState) return;
    console.log('Взаимодействие с игрой:', gameState);

    // Пример обновления данных
    setGameState(prevState => ({
      ...prevState,
      totalClicks: prevState.totalClicks + prevState.damageLevel,
      energy: Math.max(prevState.energy - 10, 0)
    }));

    // Здесь нужно обновить данные на сервере
  }, [gameState]);

  // Проверка данных во время рендеринга
  if (isLoading) {
    return <div>Загрузка состояния игры...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!gameState) {
    return <div>Нет данных игры для отображения</div>;
  }

  console.log('Состояние игры:', gameState);

  return (
    <div className="game-container">
      <div className="clicker-container" ref={clickerRef} onClick={handleInteraction}>
        <p>Клики: {gameState.totalClicks}</p>
        <p>Энергия: {gameState.energy} / {gameState.energyMax}</p>
        <p>Уровень урона: {gameState.damageLevel}</p>
      </div>
    </div>
  );
}

export default EatsApp;
