import React, { useState, useEffect, useCallback } from 'react';
import './EatsApp.css';
import clickerImage from '../public/clicker-image.png';
import UniverseData from './UniverseData';

function EatsApp() {
  const [totalClicks, setTotalClicks] = useState(() => {
    console.log("Инициализация состояния. Всего кликов из UniverseData:", UniverseData.getTotalClicks());
    return UniverseData.getTotalClicks();
  });

  useEffect(() => {
    console.log('EatsApp смонтирован. Текущее количество кликов:', totalClicks);
    const updateTotalClicks = (newTotal) => {
      console.log('Обновление слушателя. Новое количество кликов:', newTotal);
      setTotalClicks(newTotal);
    };

    UniverseData.addListener(updateTotalClicks); // Добавляем слушатель для обновления данных

    return () => {
      UniverseData.removeListener(updateTotalClicks); // Удаляем слушатель при размонтировании компонента
    };
  }, [totalClicks]);

  const handleClick = useCallback(async () => {
    if (!UniverseData.isDataLoaded) {
      console.error('Данные ещё не загружены. Нельзя кликнуть.');
      return; // Запрещаем клики до загрузки данных
    }

    console.log('Обработка клика. Текущее количество кликов:', totalClicks);
    const newTotalClicks = UniverseData.incrementTotalClicks();
    console.log('Новое количество кликов:', newTotalClicks);
    try {
      await UniverseData.saveToServer(); // Сохраняем данные на сервере
      console.log('Сохранение на сервере завершено. Текущее количество кликов:', UniverseData.getTotalClicks());
    } catch (error) {
      console.error('Ошибка при сохранении на сервере:', error);
    }
  }, [totalClicks]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="balance-container">
          <img src={clickerImage} alt="Balance Icon" className="balance-icon" />
          <p>{totalClicks}</p>
        </div>
        <div className="clicker-container" onClick={handleClick}>
          <img src={clickerImage} alt="Clicker" className="clicker-image" />
        </div>
      </header>
    </div>
  );
}

export default EatsApp;
