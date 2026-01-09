import React, { useState, useEffect, useCallback, useRef } from 'react';
import words from 'an-array-of-english-words';
import { useSwipeable } from 'react-swipeable';

// Convert word array to Set for O(1) lookup performance
const wordSet = new Set(words);
import './GameBoard.css';
import ScoreDisplay from './ScoreDisplay';
import NextTiles from './NextTiles';
import Grid from './Grid';
import IntroOverlay from './IntroOverlay';
import Countdown from './Countdown';
// Import icons
import { FaRedo, FaPlay, FaPause, FaArrowLeft, FaArrowRight, FaArrowDown, FaBook } from 'react-icons/fa';

const GRID_WIDTH = 9;
const GRID_HEIGHT = 9;
const TICK_SPEED = 500;
const LETTER_POINTS = 10;

const GameBoard = () => {
  const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null)));
  const [currentTile, setCurrentTile] = useState(null);
  const [position, setPosition] = useState({ x: Math.floor(GRID_WIDTH/2), y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nextTiles, setNextTiles] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [combo, setCombo] = useState(0);
  const [hardDrop, setHardDrop] = useState(false);
  const [clearedCells, setClearedCells] = useState(new Set());
  const [foundWords, setFoundWords] = useState([]);
  const [showWordList, setShowWordList] = useState(true); 
  const [showRules, setShowRules] = useState(false);
  const [countdown, setCountdown] = useState(3); // Initialize with 3 for game start

  // Letter frequencies based on English language usage (percentages)
  const letterFrequencies = {
    'E': 12.02, 'T': 9.10, 'A': 8.12, 'O': 7.68, 'I': 7.31, 'N': 6.95, 'S': 6.28, 
    'R': 6.02, 'H': 5.92, 'D': 4.32, 'L': 3.98, 'U': 2.88, 'C': 2.71, 'M': 2.61, 
    'F': 2.30, 'Y': 2.11, 'W': 2.09, 'G': 2.03, 'P': 1.82, 'B': 1.49, 'V': 1.11, 
    'K': 0.69, 'X': 0.17, 'Q': 0.11, 'J': 0.10, 'Z': 0.07
  };
  
  // Keep track of recently generated letters
  const [recentLetters, setRecentLetters] = useState([]);
  
  // Generate a random letter based on frequency
  const generateRandomLetter = useCallback(() => {
    const rand = Math.random() * 100;
    let cumulativeFreq = 0;
    
    for (const [letter, freq] of Object.entries(letterFrequencies)) {
      cumulativeFreq += freq;
      if (rand <= cumulativeFreq) {
        return letter;
      }
    }
    return 'E'; // Fallback
  }, []);

  // Initialize next tiles
  useEffect(() => {
    const initialNextTiles = Array(5).fill().map(() => generateRandomLetter());
    setNextTiles(initialNextTiles);
    spawnTile(initialNextTiles[0]);
    setNextTiles(prev => [...prev.slice(1), generateRandomLetter()]);
  }, [generateRandomLetter]);

  const spawnTile = (letter) => {
    setCurrentTile(letter);
    setPosition({ x: Math.floor(GRID_WIDTH/2), y: 0 });
    setHardDrop(false);
    
    // Check for game over immediately upon spawn
    if (grid[0][Math.floor(GRID_WIDTH/2)]) {
      setGameOver(true);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || countdown !== null || showRules) return;
    
    const tick = setInterval(() => {
      moveTileDown();
    }, hardDrop ? 50 : TICK_SPEED);

    return () => clearInterval(tick);
  }, [position, gameOver, isPaused, hardDrop, countdown, showRules]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished
      setCountdown(null);
      setIsPaused(false);
    }
  }, [countdown]);

  const moveTileDown = useCallback(() => {
    if (gameOver || isPaused) return;

    const newY = position.y + 1;

    if (isValidMove(position.x, newY)) {
      setPosition(prev => ({ ...prev, y: newY }));
    } else {
      // Lock tile
      lockTile();
    }
  }, [position, grid, gameOver, isPaused]);

  const moveTileLeft = useCallback(() => {
    if (gameOver || isPaused || hardDrop) return;
    if (isValidMove(position.x - 1, position.y)) {
      setPosition(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [position, grid, gameOver, isPaused, hardDrop]);

  const moveTileRight = useCallback(() => {
    if (gameOver || isPaused || hardDrop) return;
    if (isValidMove(position.x + 1, position.y)) {
      setPosition(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [position, grid, gameOver, isPaused, hardDrop]);

  const hardDropTile = useCallback(() => {
    if (gameOver || isPaused) return;
    setHardDrop(true);
  }, [gameOver, isPaused]);

  const isValidMove = (x, y) => {
    if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return false;
    if (grid[y][x] !== null) return false;
    return true;
  };

  // Calculate where the tile would land if dropped
  const calculateGhostPosition = useCallback(() => {
    if (!currentTile) return null;

    let ghostY = position.y;
    while (ghostY < GRID_HEIGHT && isValidMove(position.x, ghostY + 1)) {
      ghostY++;
    }

    return { x: position.x, y: ghostY };
  }, [position, grid, currentTile]);

  const lockTile = () => {
    const newGrid = [...grid.map(row => [...row])];
    newGrid[position.y][position.x] = currentTile;
    setGrid(newGrid);
    setHardDrop(false);
    
    // Check for words
    checkForWords(newGrid);
    
    // Spawn next tile
    const nextLetter = nextTiles[0];
    setNextTiles(prev => [...prev.slice(1), generateRandomLetter()]);
    spawnTile(nextLetter);
  };

  const checkForWords = (currentGrid) => {
    let wordsFound = [];
    let cellsToClear = new Set();
    
    // Check horizontal
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let currentWord = '';
      let currentCells = [];
      
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = currentGrid[y][x];
        if (cell) {
          currentWord += cell;
          currentCells.push({x, y});
        } else {
          if (currentWord.length >= 4 && wordSet.has(currentWord.toLowerCase())) {
            wordsFound.push(currentWord);
            currentCells.forEach(c => cellsToClear.add(`${c.y},${c.x}`));
          }
          currentWord = '';
          currentCells = [];
        }
      }
      if (currentWord.length >= 4 && wordSet.has(currentWord.toLowerCase())) {
        wordsFound.push(currentWord);
        currentCells.forEach(c => cellsToClear.add(`${c.y},${c.x}`));
      }
    }
    
    // Check vertical
    for (let x = 0; x < GRID_WIDTH; x++) {
      let currentWord = '';
      let currentCells = [];
      
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const cell = currentGrid[y][x];
        if (cell) {
          currentWord += cell;
          currentCells.push({x, y});
        } else {
          if (currentWord.length >= 4 && wordSet.has(currentWord.toLowerCase())) {
            wordsFound.push(currentWord);
            currentCells.forEach(c => cellsToClear.add(`${c.y},${c.x}`));
          }
          currentWord = '';
          currentCells = [];
        }
      }
      if (currentWord.length >= 4 && wordSet.has(currentWord.toLowerCase())) {
        wordsFound.push(currentWord);
        currentCells.forEach(c => cellsToClear.add(`${c.y},${c.x}`));
      }
    }
    
    if (wordsFound.length > 0) {
      // Calculate score
      let points = 0;
      wordsFound.forEach(word => {
        points += word.length * LETTER_POINTS;
      });
      
      // Combo multiplier
      const newCombo = combo + wordsFound.length;
      setCombo(newCombo);
      setScore(prev => prev + (points * newCombo));
      
      // Update cleared cells for animation
      setClearedCells(cellsToClear);
      setFoundWords(prev => [...wordsFound, ...prev].slice(0, 5)); // Keep last 5 words
      
      // Clear cells after animation
      setTimeout(() => {
        const nextGrid = currentGrid.map((row, y) => 
          row.map((cell, x) => cellsToClear.has(`${y},${x}`) ? null : cell)
        );
        
        // Apply gravity
        applyGravity(nextGrid);
        setClearedCells(new Set());
      }, 400);
    } else {
      setCombo(0);
    }
  };

  const applyGravity = (gridToUpdate) => {
    const newGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
    
    for (let x = 0; x < GRID_WIDTH; x++) {
      let writeY = GRID_HEIGHT - 1;
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (gridToUpdate[y][x] !== null) {
          newGrid[writeY][x] = gridToUpdate[y][x];
          writeY--;
        }
      }
    }
    setGrid(newGrid);
  };

  const handleKeyDown = useCallback((e) => {
    if (gameOver || (isPaused && !showRules) || countdown !== null) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        moveTileLeft();
        break;
      case 'ArrowRight':
        moveTileRight();
        break;
      case 'ArrowDown':
        moveTileDown();
        break;
      case ' ':
        hardDropTile();
        break;
      case 'p':
        setIsPaused(prev => !prev);
        break;
      case 'd': // Add a debug key to toggle word list
        setShowWordList(prev => !prev);
        break;
      default:
        break;
    }
  }, [position, grid, gameOver, moveTileDown, currentTile, isPaused, moveTileLeft, moveTileRight, hardDropTile, countdown, showRules]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => moveTileLeft(),
    onSwipedRight: () => moveTileRight(),
    onSwipedDown: () => hardDropTile(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  const handleRestart = () => {
    setGrid(Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null)));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setCombo(0);
    setFoundWords([]);
    setCountdown(3); // Reset countdown to 3
    setShowRules(false);
    setHardDrop(false);
    setClearedCells(new Set());
    
    // Generate new tiles and immediately spawn the first one
    const newNextTiles = Array(5).fill().map(() => generateRandomLetter());
    const firstTile = newNextTiles[0];
    const remainingTiles = [...newNextTiles.slice(1), generateRandomLetter()];
    
    setCurrentTile(firstTile);
    setNextTiles(remainingTiles);
    setPosition({ x: Math.floor(GRID_WIDTH/2), y: 0 });
  };

  const handleRulesClick = () => {
    setIsPaused(true);
    setShowRules(true);
  };

  const handleResumeFromRules = () => {
    setShowRules(false);
    setCountdown(3); // Start countdown
  };

  return (
    <div className="game-container" {...handlers}>
      <div className="game-header">
        <ScoreDisplay score={score} combo={combo} />
        <div className="button-group">
           <button className="icon-button" onClick={handleRulesClick} title="Rules">
            <FaBook />
          </button>
          <button className="icon-button" onClick={() => setIsPaused(prev => !prev)} title={isPaused ? "Resume" : "Pause"}>
            {isPaused ? <FaPlay /> : <FaPause />}
          </button>
          <button className="icon-button" onClick={handleRestart} title="Restart">
            <FaRedo />
          </button>
        </div>
      </div>

      <NextTiles nextTiles={nextTiles} />

      <Grid
        grid={grid}
        position={position}
        currentTile={currentTile}
        clearedCells={clearedCells}
        ghostPosition={calculateGhostPosition()}
      />

      <div className="controls">
        <button className="control-button" onClick={moveTileLeft}>
          <FaArrowLeft />
        </button>
        <button className="control-button center-button" onClick={hardDropTile}>
          <span className="button-text">DROP</span>
          <FaArrowDown />
        </button>
        <button className="control-button" onClick={moveTileRight}>
          <FaArrowRight />
        </button>
      </div>

      {gameOver && (
        <div className="overlay glass-panel">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button className="start-button" onClick={handleRestart}>
            <FaRedo /> Play Again
          </button>
        </div>
      )}

      {isPaused && !gameOver && !showRules && countdown === null && (
        <div className="overlay glass-panel">
          <h2>Paused</h2>
          <button className="start-button" onClick={() => setIsPaused(false)}>
            <FaPlay /> Resume
          </button>
        </div>
      )}

      {showRules && (
        <IntroOverlay onStartGame={handleResumeFromRules} isResume={true} />
      )}

      {countdown !== null && (
        <Countdown 
          count={countdown === 0 ? 0 : countdown} 
          onComplete={() => setCountdown(null)}
        />
      )}
    </div>
  );
};

export default GameBoard;