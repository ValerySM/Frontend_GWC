import React, { useState } from 'react';
import EWE from '../Universes/EWE/src/EWE';
import EcoGame from '../Universes/ECI/EcoGame';
import EatsApp from '../Universes/EWI/src/EatsApp';
import '../css/UniverseSwitcher.css';
import loadingImage from '../components/public/load_screen_univ.avif';

const UniverseSwitcher = () => {
  const [currentUniverse, setCurrentUniverse] = useState('EWI');
  const [nextUniverse, setNextUniverse] = useState('');
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const universeOrder = ['EWE', 'ECI', 'EWI'];

  const getNextUniverse = (direction) => {
    const currentIndex = universeOrder.indexOf(currentUniverse);
    if (direction === 'next') {
      return universeOrder[(currentIndex + 1) % universeOrder.length];
    } else if (direction === 'prev') {
      return universeOrder[(currentIndex - 1 + universeOrder.length) % universeOrder.length];
    }
  };

  const changeUniverse = (direction) => {
    setIsButtonDisabled(true); // Делаем кнопки неактивными
    const btnClass = direction === 'next' ? 'right-move' : 'left-move';
    const btnElement = direction === 'next' ? document.querySelector('.npBtn:nth-child(2)') : document.querySelector('.npBtn:nth-child(1)');
    btnElement.classList.add(btnClass);

    const animationDuration = 1400; // Время в миллисекундах

    setTimeout(() => {
      setIsLoading(true);
      const next = getNextUniverse(direction);
      setNextUniverse(next);
      setTimeout(() => {
        setCurrentUniverse(next);
        setIsLoading(false);
        setIsButtonDisabled(false);
      }, 3000);
    }, animationDuration);
  };

  const renderUniverse = () => {
    switch (currentUniverse) {
      case 'EWE':
        return <EWE setIsTabOpen={setIsTabOpen} />;
      case 'ECI':
        return <EcoGame setIsTabOpen={setIsTabOpen} />;
      case 'EWI':
        return <EatsApp setIsTabOpen={setIsTabOpen} />;
      default:
        return <EWE setIsTabOpen={setIsTabOpen} />;
    }
  };

  return (
    <div className='container'>
      {!isTabOpen && !isLoading && (
        <div className='btn-container'>
          <button 
            className='npBtn' 
            onClick={() => changeUniverse('prev')}
            disabled={isButtonDisabled}
          >
            {getNextUniverse('prev')}
          </button>
          <button 
            className='npBtn' 
            onClick={() => changeUniverse('next')}
            disabled={isButtonDisabled}
          >
            {getNextUniverse('next')}
          </button>
        </div>
      )}
      <main>
        {isLoading ? (
          <div className="loading-screen">
            <img src={loadingImage} alt="Loading" />
            <p>Переход во вселенную {nextUniverse}</p>
          </div>
        ) : (
          renderUniverse()
        )}
      </main>
    </div>
  );
};

export default UniverseSwitcher;
