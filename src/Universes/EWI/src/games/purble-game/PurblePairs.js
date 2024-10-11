import React, { useState, useEffect } from 'react';
import './PurblePairs.css';
import backgroundMusicFile from './audio/pokemonGym.mp3';
import winEffectFile from './audio/win.mp3';
import startButtonSound from './audio/start.mp3';
import cardClickSound from './audio/card.mp3';
import UniverseData from '../../UniverseData';




// Импортируем изображения
import img1 from './img/1.png';
import img2 from './img/2.png';
import img3 from './img/3.png';
import img4 from './img/4.png';
import img5 from './img/5.png';
import img6 from './img/6.png';
import img7 from './img/7.png';
import img8 from './img/8.png';

// Базовая коллекция карт
const baseCollection = [
    { id: 1, art: img1 },
    { id: 2, art: img2 },
    { id: 3, art: img3 },
    { id: 4, art: img4 },
    { id: 5, art: img5 },
    { id: 6, art: img6 },
    { id: 7, art: img7 },
    { id: 8, art: img8 },
];

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const MessageBox = ({ message, onClose }) => (
  <div className="message-box">
    <p>{message}</p>
    <button onClick={onClose}>ОК</button>
  </div>
);

const PurblePairs = ({ onGameEnd }) => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isWin, setIsWin] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [timer, setTimer] = useState(60);
    const [showMessage, setShowMessage] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        const doubledCards = shuffleArray([...baseCollection, ...baseCollection].map(card => ({
            ...card,
            isFlipped: false,
            isMatched: false
        })));
        setCards(doubledCards);
    }, []);

    useEffect(() => {
        let interval;
        if (isGameStarted && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && isGameStarted) {
            setIsGameStarted(false);
            setMessageText(`Время вышло! Вы проиграли. Ваш счет: ${score}`);
            setShowMessage(true);
        }
        return () => clearInterval(interval);
    }, [isGameStarted, timer, score]);

    useEffect(() => {
        const audio = new Audio(backgroundMusicFile);
        audio.loop = true;

        const playAudio = () => {
            audio.play().catch(error => console.error('Ошибка при воспроизведении фоновой музыки:', error));
        };

        playAudio();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                audio.pause();
            } else {
                playAudio();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            audio.pause();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (matchedPairs.length === baseCollection.length && isGameStarted) {
            const endTime = Date.now();
            const timeTaken = (endTime - startTime) / 1000;
            const speedBonus = Math.max(0, Math.floor((60 - timeTaken) * 2));
            const victoryBonus = 100;

            const finalScore = score + speedBonus + victoryBonus;

            setScore(finalScore);
            setIsWin(true);
            setIsGameStarted(false);
            setMessageText(`Поздравляем! Вы победили! Ваш финальный счет: ${finalScore}`);
            setShowMessage(true);
            new Audio(winEffectFile).play();
            
            // Обновляем глобальный счет
            UniverseData.addGameScore('purblePairs', finalScore);
            console.log('Updated PurblePairs score:', finalScore);
            console.log('New total clicks:', UniverseData.getTotalClicks());
        }
    }, [matchedPairs, score, startTime, isGameStarted]);

    const playSound = (soundFile) => {
        const audio = new Audio(soundFile);
        audio.play().catch(error => console.error('Ошибка при воспроизведении звука:', error));
    };

    const resetGame = () => {
        setIsWin(false);
        setIsGameStarted(false);
        setTimer(60);
        setScore(0);
        setMatchedPairs([]);
        setFlippedCards([]);
        setShowMessage(false);
        setCards(shuffleArray([...baseCollection, ...baseCollection].map(card => ({
            ...card,
            isFlipped: false,
            isMatched: false
        }))));
    };

    const startGame = () => {
        playSound(startButtonSound);
        resetGame();
        setIsGameStarted(true);
        setStartTime(Date.now());
    };

    const handleCardClick = (index) => {
        if (!isGameStarted || cards[index].isFlipped || cards[index].isMatched) return;

        playSound(cardClickSound);

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedCards = [...flippedCards, index];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            const [firstIndex, secondIndex] = newFlippedCards;
            if (newCards[firstIndex].id === newCards[secondIndex].id) {
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setMatchedPairs([...matchedPairs, newCards[firstIndex].id]);
                setScore(prevScore => prevScore + 10);
            } else {
                setTimeout(() => {
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    setCards(newCards);
                }, 800);
            }
            setFlippedCards([]);
        }
    };

    const handleMessageClose = () => {
        setShowMessage(false);
        if (typeof onGameEnd === 'function') {
            onGameEnd(score, isWin);
        } else {
            resetGame();
        }
    };

    return (
        <div className="purble-pairs">
            <div className="game-header">
                <div className="timer">Время:<p className='timerBtn'>{timer}</p></div>
                <div className='score'>Счёт:<p className='scoreBtn'>{score}</p></div>
            </div>
            <button className='btn-game' onClick={startGame}>Начать</button>
            <div className="cards">
                <div className='cards-grid'>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                            onClick={() => handleCardClick(index)}
                        >
                            <div className="card-front">
                                <img className='card-img' src={card.art} alt={`Карта ${card.id}`} />
                            </div>
                            <div className="card-back">
                                <span className='back-descr'>Open</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showMessage && <MessageBox message={messageText} onClose={handleMessageClose} />}
        </div>
    );
};

export default PurblePairs;