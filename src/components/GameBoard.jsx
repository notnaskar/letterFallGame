import React, { useState, useEffect, useCallback, useRef } from 'react';
import words from 'an-array-of-english-words';
import { useSwipeable } from 'react-swipeable';
import { getCountdownGrid } from '../utils/CountdownPatterns';

// Convert word array to Set for O(1) lookup performance
const wordSet = new Set(words);
import './GameBoard.css';
import ScoreDisplay from './ScoreDisplay';
import NextTiles from './NextTiles';
import Grid from './Grid';
import IntroOverlay from './IntroOverlay';
// Countdown component removed
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

  const isCountdownActive = countdown !== null;

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
  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;

    // Countdown sequence: 3 -> 2 -> 1 -> 0 (GO) -> null (Start)
    if (countdown >= 0) {
      const timer = setTimeout(() => {
        if (countdown === 0) {
          setCountdown(null);
          setIsPaused(false);
          // Advance turn immediately after GO? Or just let game loop take over.
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000); // 1 second per step
      return () => clearTimeout(timer);
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
    if (!currentTile || isCountdownActive) return null;

    let ghostY = position.y;
    while (ghostY < GRID_HEIGHT && isValidMove(position.x, ghostY + 1)) {
      ghostY++;
    }

    return { x: position.x, y: ghostY };
  }, [position, grid, currentTile, isCountdownActive]);

  // Encapsulate turn advancement logic
  const advanceTurn = useCallback(() => {
    const nextLetter = nextTiles[0];
    setNextTiles(prev => [...prev.slice(1), generateRandomLetter()]);
    spawnTile(nextLetter);
  }, [nextTiles, generateRandomLetter]);

  const lockTile = () => {
    const newGrid = [...grid.map(row => [...row])];
    newGrid[position.y][position.x] = currentTile;
    setGrid(newGrid);
    setHardDrop(false);
    
    // Check for words
    const wordsFound = checkForWords(newGrid);
    
    // Only spawn immediately if NO words were found/clearing
    // If words found, advanceTurn will be called after animation
    if (!wordsFound) {
      advanceTurn();
    }
  };

  const checkForWords = (currentGrid) => {
    let candidateWords = new Set();
    let cellsToClear = new Set();
    
    // Helper to process a sequence of letters for valid words
    const processSequence = (letters, startIdx, isVertical) => {
      const sequenceStr = letters.map(l => l.char).join('');
      if (sequenceStr.length < 4) return;

      // Check all substrings of length >= 4
      for (let len = 4; len <= sequenceStr.length; len++) {
        for (let i = 0; i <= sequenceStr.length - len; i++) {
          const subWord = sequenceStr.substring(i, i + len);
          
          // Check forward
          if (wordSet.has(subWord.toLowerCase())) {
            candidateWords.add(subWord);
            for (let k = 0; k < len; k++) {
              const cellIdx = i + k;
              const cellCoords = letters[cellIdx].coords;
              cellsToClear.add(`${cellCoords.y},${cellCoords.x}`);
            }
          }
          
          // Check reverse
          const reversedSubWord = subWord.split('').reverse().join('');
          if (wordSet.has(reversedSubWord.toLowerCase())) {
             candidateWords.add(reversedSubWord);
             for (let k = 0; k < len; k++) {
              const cellIdx = i + k;
              const cellCoords = letters[cellIdx].coords;
              cellsToClear.add(`${cellCoords.y},${cellCoords.x}`);
            }
          }
        }
      }
    };

    // Check horizontal
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let currentSeq = [];
      
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = currentGrid[y][x];
        if (cell) {
          currentSeq.push({ char: cell, coords: {x, y} });
        } else {
          processSequence(currentSeq);
          currentSeq = [];
        }
      }
      processSequence(currentSeq);
    }
    
    // Check vertical
    for (let x = 0; x < GRID_WIDTH; x++) {
      let currentSeq = [];
      
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const cell = currentGrid[y][x];
        if (cell) {
          currentSeq.push({ char: cell, coords: {x, y} });
        } else {
          processSequence(currentSeq);
          currentSeq = [];
        }
      }
      processSequence(currentSeq);
    }
    
    if (candidateWords.size > 0) {
      // Filter out substrings for fair scoring
      // e.g. "HEART" (5) vs "HEAR" (4). Keep "HEART".
      const uniqueWords = Array.from(candidateWords).sort((a, b) => b.length - a.length);
      const finalWords = [];
      
      for (const word of uniqueWords) {
        // If this word is not a substring of any already kept word, keep it
        const isSubstring = finalWords.some(keptWord => keptWord.includes(word));
        if (!isSubstring) {
          finalWords.push(word);
        }
      }

      // Calculate score
      let points = 0;
      finalWords.forEach(word => {
        points += word.length * LETTER_POINTS;
      });
      
      // Combo multiplier
      const newCombo = combo + finalWords.length;
      setCombo(newCombo);
      setScore(prev => prev + (points * newCombo));
      
      // Update cleared cells for animation
      setClearedCells(cellsToClear);
      setFoundWords(prev => [...finalWords, ...prev].slice(0, 5)); // Keep last 5 words
      
      // Clear cells after animation
      setTimeout(() => {
        const nextGrid = currentGrid.map((row, y) => 
          row.map((cell, x) => cellsToClear.has(`${y},${x}`) ? null : cell)
        );
        
        // Apply gravity
        applyGravity(nextGrid);
        setClearedCells(new Set());
        
        // Advance turn AFTER clearing is done
        advanceTurn();
      }, 400);
      return true; // Words found
    } else {
      setCombo(0);
      return false; // No words found
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

  const gridToRender = isCountdownActive && countdown >= 0 
    ? getCountdownGrid(countdown) 
    : grid;

  // Mask current tile during countdown to avoid confusion
  const tileToRender = isCountdownActive ? null : currentTile;

  return (
    <div className="game-container" {...handlers}>
      <div className={`game-header ${isCountdownActive ? 'content-blur' : ''}`}>
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

      <div className={`next-tiles-wrapper ${isCountdownActive ? 'content-blur' : ''}`}>
        <NextTiles nextTiles={nextTiles} />
      </div>

      <Grid
        grid={gridToRender}
        position={position}
        currentTile={tileToRender}
        clearedCells={clearedCells}
        ghostPosition={calculateGhostPosition()}
      />

      <div className={`controls ${isCountdownActive ? 'content-blur' : ''}`}>
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
    </div>
  );
};

export default GameBoard;