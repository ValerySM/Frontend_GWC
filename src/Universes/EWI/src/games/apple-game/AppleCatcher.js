import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './AppleCatcher.css';
// import UniverseData from '../../UniverseData';

const AppleCatcher = ({ onGameOver }) => {
    const [gameState, setGameState] = useState({
        score: 0,
        time: 60,
        apples: [],
        playerPosition: 50,
        gameStarted: false,
        showResult: false
    });

    const [scoreAnimations, setScoreAnimations] = useState([]);

    const gameLoopRef = useRef(null);
    const lastUpdateTimeRef = useRef(0);
    const timerRef = useRef(null);
    const gameEndedRef = useRef(false);

    const checkCollisions = useCallback(() => {
        setGameState(prevState => {
            let newScore = prevState.score;
            const newApples = prevState.apples.filter(apple => {
                const catcherWidth = 25;
                const catcherLeft = prevState.playerPosition - catcherWidth / 2;
                const catcherRight = prevState.playerPosition + catcherWidth / 2;
                const catcherTop = 75;
                const appleBottom = apple.y + 5;

                if (
                    appleBottom >= catcherTop &&
                    appleBottom <= catcherTop + 10 &&
                    apple.x >= catcherLeft &&
                    apple.x <= catcherRight
                ) {
                    const scoreChange = apple.type === 'good' ? 500 : -5000;
                    newScore += scoreChange;

                    const animationId = `${apple.id}-${Math.random().toString(36).substr(2, 9)}`;
                    setScoreAnimations(prev => [...prev, {
                        id: animationId,
                        x: apple.x,
                        y: catcherTop - 15,
                        score: scoreChange
                    }]);

                    setTimeout(() => {
                        setScoreAnimations(prev => prev.filter(anim => anim.id !== animationId));
                    }, 1000);

                    return false;
                }
                return apple.y < 100;
            });

            return {
                ...prevState,
                apples: newApples,
                score: newScore
            };
        });
    }, []);

    const gameLoop = useCallback((timestamp) => {
        if (timestamp - lastUpdateTimeRef.current > 50) {
            lastUpdateTimeRef.current = timestamp;
            setGameState(prevState => {
                if (!prevState.gameStarted) return prevState;

                let newApples = prevState.apples.map(apple => ({
                    ...apple,
                    y: apple.y + 1,
                }));

                if (Math.random() < 0.05 && newApples.length < 10) {
                    newApples.push({
                        id: Date.now(),
                        x: Math.random() * 100,
                        y: 0,
                        type: Math.random() > 0.2 ? 'good' : 'rotten',
                    });
                }

                newApples = newApples.filter(apple => apple.y < 100);

                return {
                    ...prevState,
                    apples: newApples,
                };
            });

            checkCollisions();
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [checkCollisions]);

    useEffect(() => {
        if (gameState.gameStarted && gameState.time > 0) {
            timerRef.current = setInterval(() => {
                setGameState(prev => ({ ...prev, time: prev.time - 1 }));
            }, 1000);

            gameLoopRef.current = requestAnimationFrame(gameLoop);

            return () => {
                clearInterval(timerRef.current);
                cancelAnimationFrame(gameLoopRef.current);
            };
        } else if (gameState.time === 0) {
            endGame();
        }
    }, [gameState.gameStarted, gameState.time, gameLoop]);

    const startGame = () => {
        setGameState(prevState => ({
            ...prevState,
            gameStarted: true,
            score: 0,
            time: 60,
            apples: [],
            showResult: false
        }));
        gameEndedRef.current = false;
    };

    const endGame = useCallback(() => {
        if (gameEndedRef.current) return;
        gameEndedRef.current = true;

        setGameState(prevState => ({
            ...prevState,
            gameStarted: false,
            showResult: true
        }));

        // UniverseData.addGameScore('appleCatcher', gameState.score);
        console.log('Updated AppleCatcher score:', gameState.score);
        // console.log('New total clicks:', UniverseData.getTotalClicks());

        clearInterval(timerRef.current);
        cancelAnimationFrame(gameLoopRef.current);
    }, [gameState.score]);

    const movePlayer = useCallback((e) => {
        if (gameState.gameStarted) {
            const touch = e.touches[0];
            const newPosition = (touch.clientX / window.innerWidth) * 100;
            setGameState(prevState => ({ ...prevState, playerPosition: newPosition }));
        }
    }, [gameState.gameStarted]);

    const handleResultClose = () => {
        setGameState(prevState => ({ ...prevState, showResult: false }));
        onGameOver(gameState.score);
    };

    const renderApples = useMemo(() => {
        return gameState.apples.map((apple) => (
            <div
                key={apple.id}
                className={`neon-apple ${apple.type === 'good' ? 'good-apple' : 'rotten-apple'}`}
                style={{
                    left: `${apple.x}%`,
                    top: `${apple.y}%`,
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: apple.type === 'good' ? 'green' : 'brown',
                    position: 'absolute',
                }}
            />
        ));
    }, [gameState.apples]);

    return (
        <div className="apple-catcher" onTouchMove={movePlayer}>
            <div className="game-info">
                <span>Score: {gameState.score}</span>
                <span>Time: {gameState.time}</span>
            </div>
            {!gameState.gameStarted && !gameState.showResult && (
                <button className="start-button" onClick={startGame}>Start Game</button>
            )}
            <div className="game-area">
                {renderApples}
                {scoreAnimations.map((anim) => (
                    <div
                        key={anim.id}
                        className={`score-animation ${anim.score > 0 ? 'positive' : 'negative'}`}
                        style={{
                            left: `${anim.x}%`,
                            top: `${anim.y}%`,
                        }}
                        ref={(el) => {
                            if (el) {
                                setTimeout(() => el.classList.add('active'), 50);
                            }
                        }}
                    >
                        {anim.score > 0 ? `+${anim.score}` : anim.score}
                    </div>
                ))}
                <div
                    className="neon-catcher"
                    style={{
                        left: `${gameState.playerPosition}%`,
                        width: '80px',
                        height: '30px',
                        backgroundColor: 'greenyellow',
                        position: 'absolute',
                        bottom: '20%',
                        borderRadius: '13% 13% 100% 100%'
                    }}
                />
            </div>
            {gameState.showResult && (
                <div className="result-modal">
                    <div className="result-content">
                        <h2>END GAME</h2>
                        <p>Score: {gameState.score}</p>
                        <button onClick={handleResultClose}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppleCatcher;
