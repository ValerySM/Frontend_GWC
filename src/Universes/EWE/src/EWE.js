import React, { useState, useEffect } from 'react';
import Score from './comp/Score';
import './css/EWE.css';
import FarmButton from './comp/FarmButton';

function Ewe({ userId }) {
  const [tokens, setTokens] = useState(0);
  const [farmedTokens, setFarmedTokens] = useState(0);
  const [isFarming, setIsFarming] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedFarmingTime, setElapsedFarmingTime] = useState(0);
  const [animationClass, setAnimationClass] = useState('fade-in');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const texts = [
    // ... (оставьте массив texts без изменений)
  ];

  const maxTokens = 0.128;
  const farmingDuration = 12 * 60 * 60;

  // ... (остальные useEffect и функции остаются без изменений)

  const handleNextText = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationClass('fade-out');
    
    setTimeout(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      setAnimationClass('fade-in');
      setIsAnimating(false);
    }, 500);

    const nextButton = document.querySelector('.btntxt2');
    if (nextButton) {
      nextButton.classList.add('sparkle');
      setTimeout(() => {
        nextButton.classList.remove('sparkle');
      }, 500);
    }
  };

  const handlePrevText = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationClass('fade-out');
    
    setTimeout(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex - 1 + texts.length) % texts.length);
      setAnimationClass('fade-in');
      setIsAnimating(false);
    }, 500);

    const prevButton = document.querySelector('.btntxt1');
    if (prevButton) {
      prevButton.classList.add('sparkle');
      setTimeout(() => {
        prevButton.classList.remove('sparkle');
      }, 500);
    }
  };

  const progressPercentage = (farmedTokens / maxTokens) * 100;

  return (
    <div className="App">
      <header className="header">
        <Score tokens={tokens} />
      </header>
      <div className="content">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          >
            <span className="progress-text">{progressPercentage.toFixed(1)}%</span>
          </div>
        </div>
        <div className={`animation_contain`}>
          <button onClick={handlePrevText} className='btntxt1 btntxt'>←</button>
          <div className={`text-display ${animationClass}`}>
            <h3>{texts[currentTextIndex].title}</h3><br />
            {texts[currentTextIndex].content}
          </div>
          <button onClick={handleNextText} className='btntxt2 btntxt'>→</button>
        </div>
        <FarmButton
          isFarming={isFarming}
          farmedTokens={farmedTokens}
          onClick={handleButtonClick}
        />
      </div>
    </div>
  );
}

export default Ewe;