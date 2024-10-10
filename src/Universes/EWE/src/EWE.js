import React, { useState, useEffect } from 'react';
import Score from './comp/Score';
import './css/EWE.css';
import FarmButton from './comp/FarmButton';

function Ewe() {
  const [tokens, setTokens] = useState(0);
  const [farmedTokens, setFarmedTokens] = useState(0);
  const [isFarming, setIsFarming] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedFarmingTime, setElapsedFarmingTime] = useState(0);
  const [animationClass, setAnimationClass] = useState('fade-in');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const texts = [
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

  const maxTokens = 0.128;
  const farmingDuration = 12 * 60 * 60;
  const userId = '123'; // Замените на реальный способ получения userId

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    let farmingInterval;
    if (isFarming) {
      const interval = 1000;

      farmingInterval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.min((now - startTime) / 1000 + elapsedFarmingTime, farmingDuration);
        const farmed = (elapsed / farmingDuration) * maxTokens;

        setFarmedTokens(farmed);

        if (elapsed >= farmingDuration) {
          clearInterval(farmingInterval);
          setIsFarming(false);
          setElapsedFarmingTime(0);
          updateServerData();
        }
      }, interval);
    }

    return () => clearInterval(farmingInterval);
  }, [isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (isFarming) {
        updateServerData();
      }
    }, 60000); // Обновление каждую минуту

    return () => clearInterval(updateInterval);
  }, [tokens, farmedTokens, isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      updateServerData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tokens, farmedTokens, isFarming, startTime, elapsedFarmingTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextText();
    }, 8000);

    return () => clearInterval(interval);
  }, [currentTextIndex]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_user_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (response.ok) {
        const userData = await response.json();
        const offlineEarnings = calculateOfflineEarnings(userData.eweData);
        setTokens(userData.eweData.tokens + offlineEarnings);
        setFarmedTokens(userData.eweData.farmedTokens);
        setIsFarming(userData.eweData.isFarming);
        setStartTime(new Date(userData.eweData.startTime));
        setElapsedFarmingTime(userData.eweData.elapsedFarmingTime);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateServerData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          updates: {
            eweData: {
              tokens: tokens,
              farmedTokens: farmedTokens,
              isFarming: isFarming,
              startTime: startTime ? startTime.toISOString() : null,
              elapsedFarmingTime: elapsedFarmingTime
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update server data');
      }
    } catch (error) {
      console.error('Error updating server data:', error);
    }
  };

  const calculateOfflineEarnings = (eweData) => {
    if (!eweData.isFarming || !eweData.startTime) return 0;

    const now = new Date();
    const startTime = new Date(eweData.startTime);
    const elapsedTime = Math.min((now - startTime) / 1000 + eweData.elapsedFarmingTime, farmingDuration);
    return (elapsedTime / farmingDuration) * maxTokens;
  };

  const handleButtonClick = () => {
    if (!isFarming && farmedTokens >= maxTokens) {
      collectTokens();
    } else {
      startFarming();
    }
  };

  const startFarming = () => {
    if (!isFarming) {
      const now = new Date();
      setStartTime(now);
      setIsFarming(true);
      setElapsedFarmingTime(0);
      setFarmedTokens(0);
      updateServerData();
    }
  };

  const collectTokens = () => {
    if (farmedTokens >= maxTokens) {
      setTokens(prevTokens => {
        const newTokens = Number((prevTokens + farmedTokens).toFixed(3));
        setFarmedTokens(0);
        setIsFarming(false);
        setElapsedFarmingTime(0);
        updateServerData();
        return newTokens;
      });
    }
  };

  const handleNextText = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationClass('fade-out');
    
    setTimeout(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      setAnimationClass('fade-in');
      setIsAnimating(false);
    }, 500);

    document.querySelector('.btntxt2').classList.add('sparkle');
    setTimeout(() => {
      document.querySelector('.btntxt2').classList.remove('sparkle');
    }, 500);
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

    document.querySelector('.btntxt1').classList.add('sparkle');
    setTimeout(() => {
      document.querySelector('.btntxt1').classList.remove('sparkle');
    }, 500);
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