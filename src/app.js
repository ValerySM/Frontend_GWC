import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import EatsApp from './Universes/EWI/EatsApp';
import UniverseData from './UniverseData';

function App() {
  const [isLoading, setIsLoading] = useState(true); // Состояние для отображения загрузки
  const [isError, setIsError] = useState(false);    // Состояние для отображения ошибки

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Начинаем инициализацию данных...");
        const startTime = Date.now();
        const success = await UniverseData.initFromServer(); // Инициализация данных с сервера
        const elapsedTime = Date.now() - startTime;

        if (success) {
          console.log("Данные успешно загружены. Всего кликов:", UniverseData.getTotalClicks());
          const remainingTime = Math.max(0, 2000 - elapsedTime); // Минимальное время загрузки
          setTimeout(() => setIsLoading(false), remainingTime); // Отображаем экран загрузки
        } else {
          throw new Error("Ошибка при загрузке данных");
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setIsError(true);
        setIsLoading(false); // В случае ошибки, убираем экран загрузки
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div style={{fontSize: '24px', textAlign: 'center', marginTop: '50px'}}>Загрузка данных...</div>; // Экран загрузки
  }

  if (isError) {
    return <div style={{fontSize: '24px', textAlign: 'center', marginTop: '50px'}}>Ошибка при загрузке данных. Попробуйте позже.</div>; // Экран ошибки
  }

  return (
    <Router basename="/Frontend_GWC">
      <div className="App">
        <Switch>
          <Route exact path="/" component={EatsApp} /> {/* Рендер приложения после успешной загрузки */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
