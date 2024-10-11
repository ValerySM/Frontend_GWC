
import React, { useState, useEffect } from 'react';
import Score from './comp/Score'; // Импортируем компонент для отображения счета
import './css/EWE.css'; // Импортируем стили
import FarmButton from './comp/FarmButton'; // Импортируем кнопку для фермерства

function Ewe() {
  // Хуки состояния
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem('tokens');
    return savedTokens ? parseFloat(savedTokens) : 0; // Загружаем токены из localStorage
  });

  const [farmedTokens, setFarmedTokens] = useState(() => {
    const savedFarmedTokens = localStorage.getItem('farmedTokens');
    return savedFarmedTokens ? parseFloat(savedFarmedTokens) : 0; // Загружаем фермерские токены
  });

  const [isFarming, setIsFarming] = useState(() => {
    const savedIsFarming = localStorage.getItem('isFarming');
    return savedIsFarming === 'true'; // Загружаем статус фермерства
  });

  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem('startTime');
    return savedStartTime ? new Date(parseInt(savedStartTime, 10)) : null; // Загружаем время начала фермерства
  });

  const [elapsedFarmingTime, setElapsedFarmingTime] = useState(() => {
    const savedElapsedFarmingTime = localStorage.getItem('elapsedFarmingTime');
    return savedElapsedFarmingTime ? parseFloat(savedElapsedFarmingTime) : 0; // Загружаем прошедшее время фермерства
  });

  const [animationClass, setAnimationClass] = useState('fade-in'); // Класс для анимации
  const [currentTextIndex, setCurrentTextIndex] = useState(0); // Индекс текущего текста
  const [isAnimating, setIsAnimating] = useState(false); // Флаг для анимации

  const texts = [
    // Здесь ваши тексты
    {
      title: 'Woods',
      content: "— the echo of silence. Green Woods — the voice of depth, unheard but felt. Green Woods — freedom of creativity. Green Woods — the intertwining of worlds. Green Woods — being yourself."
    },
    {
      title: 'Two: Idea',
      content: "Our idea is to create blockchain marketplaces in the gaming sphere. We aim to help the environment by utilizing coin farming for future development. By educating people about new technologies, we provide more advanced platforms that open new horizons and opportunities."
    },
   {
      title: 'Three: Stages',
      content: "At this stage, we are developing a 2D application for coin mining, reconnecting it from a local network to our server. This will create more convenient conditions. We are adding new features to enhance quality and increase user profits."
    },
    {
      title: 'Four: News',
      content: (
        <>
          Follow our updates and news on our official Telegram channel <a href="https://t.me/Greenwoods_Community" target="_blank" rel="noopener noreferrer">@Greenwoods_Community</a>. We also have:<br />
          - <a href="https://t.me/GreenWoodsGlobal" target="_blank" rel="noopener noreferrer">RU chat</a><br />
          - <a href="https://t.me/GreenWoodschat" target="_blank" rel="noopener noreferrer">EN chat</a><br />
          - <a href="https://www.youtube.com/channel/XXXXXX" target="_blank" rel="noopener noreferrer">YouTube channel</a>
        </>
      )
    },
    {
      title: 'Five: Development',
      content: "We are not just a project that came to compete. We are here to collaborate and grow together with you! By creating a new and comfortable future, we strive to make this journey exciting and open. Our project emerged from a simple thought: 'What if?' And we are glad that you are with us. Thanks to your support, we are moving forward, and this will become part of our shared story."
    },
    {
      title: 'Six: Future',
      content: "A 3D version of our game with a more interesting interface awaits you! We plan to build a marketplace on the Telegram platform and develop our own blockchain. We will also share reviews on environmental development. More detailed information will be posted on our whitelist."
    },
    {
      title: 'Seven: Farming',
      content: "Over time, we will add new and interesting ways to mine our unique coins. On behalf of our team, we confidently state: the amount of loot received will be proportional to the participant's activity in the life of our application. We wish every participant strong motivation, for the path to success is not always easy!"
    },
    {
      title: 'Eight: Friendship',
      content: (
        <>
          We are a friendly project and do not seek to follow the reputation of others. We know our goals and see them clearly before us. We are not interested in what happens around us — we don't have time to waste on nonsense. We do not resort to cheating methods and are always open to mutually beneficial collaboration. For proposals, write to us at <a href="mailto:woodsgreen211@gmail.com">woodsgreen211@gmail.com</a>.
        </>
      )
    },
    {
      title: 'Nine: Freedom of Creativity',
      content: "We are always open to new minds! If you are a programmer, designer, or confident that you can contribute your skills to the development of the project, you know where to find us. We are a project worth believing in, for even in silence, there is an echo."
    }
  ];

  const maxTokens = 0.128; // Максимальное количество токенов
  const farmingDuration = 12 * 60 * 60; // Длительность фермерства 12 часов в секундах

  useEffect(() => {
    let farmingInterval;
    if (isFarming) {
      const interval = 1000; // Обновление каждую секунду

      farmingInterval = setInterval(() => {
        const now = new Date();
        // Вычисляем прошедшее время фермерства
        const elapsed = Math.min((now - startTime) / 1000 + elapsedFarmingTime, farmingDuration);
        const farmed = (elapsed / farmingDuration) * maxTokens; // Вычисляем фермерские токены

        setFarmedTokens(farmed);

        // Если фермерство завершено
        if (elapsed >= farmingDuration) {
          clearInterval(farmingInterval);
          setIsFarming(false);
          setElapsedFarmingTime(0);
        }
      }, interval);
    }

    return () => clearInterval(farmingInterval); // Очистка интервала при размонтировании
  }, [isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    // Сохранение состояния в localStorage
    localStorage.setItem('tokens', tokens);
    localStorage.setItem('farmedTokens', farmedTokens);
    localStorage.setItem('isFarming', isFarming);
    localStorage.setItem('startTime', startTime ? startTime.getTime() : null);
    localStorage.setItem('elapsedFarmingTime', elapsedFarmingTime);
  }, [tokens, farmedTokens, isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextText(); // Переход к следующему тексту
    }, 8000); // Каждые 8 секунд

    return () => clearInterval(interval); // Очистка интервала при размонтировании
  }, [currentTextIndex]);

  const handleButtonClick = () => {
    // Обработка нажатия кнопки
    if (!isFarming && farmedTokens >= maxTokens) {
      collectTokens(); // Сбор токенов
    } else {
      startFarming(); // Начало фермерства
    }
  };

  const startFarming = () => {
    // Начинаем фермерство
    if (!isFarming) {
      const now = new Date();
      setStartTime(now);
      setIsFarming(true);
      setElapsedFarmingTime(0);
      setFarmedTokens(0);
    }
  };

  const collectTokens = () => {
    // Сбор фермерских токенов
    if (farmedTokens >= maxTokens) {
      setTokens(prevTokens => Number((prevTokens + farmedTokens).toFixed(3))); // Обновление токенов
      setFarmedTokens(0); // Сброс фермерских токенов
      setIsFarming(false); // Завершение фермерства
      setElapsedFarmingTime(0); // Сброс прошедшего времени
    }
  };

  const handleNextText = () => {
    // Переход к следующему тексту
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationClass('fade-out');
    
    setTimeout(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      setAnimationClass('fade-in');
      setIsAnimating(false);
    }, 500); // Время анимации

    // Анимация кнопки
    document.querySelector('.btntxt2').classList.add('sparkle');
    setTimeout(() => {
      document.querySelector('.btntxt2').classList.remove('sparkle');
    }, 500);
  };

  const handlePrevText = () => {
    // Переход к предыдущему тексту
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationClass('fade-out');
    
    setTimeout(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex - 1 + texts.length) % texts.length);
      setAnimationClass('fade-in');
      setIsAnimating(false);
    }, 500); // Время анимации

    // Анимация кнопки
    document.querySelector('.btntxt1').classList.add('sparkle');
    setTimeout(() => {
      document.querySelector('.btntxt1').classList.remove('sparkle');
    }, 500);
  };

  const progressPercentage = (farmedTokens / maxTokens) * 100; // Процент фермерских токенов

  return (
    <div className="App">
      <header className="header">
        <Score tokens={tokens} /> {/* Компонент для отображения счета */}
      </header>
      <div className="content">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }} // Установка ширины полосы прогресса
          >
            <span className="progress-text">{progressPercentage.toFixed(1)}%</span> {/* Отображение процента */}
          </div>
        </div>
        <div className={`animation_contain`}>
          <button onClick={handlePrevText} className='btntxt1 btntxt'>←</button>
          <div className={`text-display ${animationClass}`}>
            <h3>{texts[currentTextIndex].title}</h3><br />
            {texts[currentTextIndex].content} {/* Отображение текста */}
          </div>
          <button onClick={handleNextText} className='btntxt2 btntxt'>→</button>
        </div>
        <FarmButton
          isFarming={isFarming} // Передача статуса фермерства
          farmedTokens={farmedTokens} // Передача количества фермерских токенов
          onClick={handleButtonClick} // Обработка нажатия на кнопку фермерства
        />
      </div>
    </div>
  );
}

export default Ewe;
