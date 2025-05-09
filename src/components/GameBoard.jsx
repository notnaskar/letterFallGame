import React, { useState, useEffect, useCallback, useRef } from 'react';
import words from 'an-array-of-english-words';
import './GameBoard.css';
import ScoreDisplay from './ScoreDisplay';
import NextTiles from './NextTiles';
import Grid from './Grid';
import WordList from './WordList';


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
  const [showWordList, setShowWordList] = useState(true); // For easy toggling

  // Letter frequencies based on English language usage (percentages)
  const letterFrequencies = {
    'E': 12.02, 'T': 9.10, 'A': 8.12, 'O': 7.68, 'I': 7.31, 'N': 6.95, 'S': 6.28, 
    'R': 6.02, 'H': 5.92, 'D': 4.32, 'L': 3.98, 'U': 2.88, 'C': 2.71, 'M': 2.61, 
    'F': 2.30, 'Y': 2.11, 'W': 2.09, 'G': 2.03, 'P': 1.82, 'B': 1.49, 'V': 1.11, 
    'K': 0.69, 'X': 0.17, 'Q': 0.11, 'J': 0.10, 'Z': 0.07
  };
  
  // Keep track of recently generated letters
  const [recentLetters, setRecentLetters] = useState([]);
  
  const getRandomLetter = () => {
    // Create a copy of the frequencies that we can modify
    const adjustedFrequencies = {...letterFrequencies};
    
    // Reduce weights for recently used letters to prevent immediate repetition
    recentLetters.forEach(letter => {
      if (adjustedFrequencies[letter]) {
        adjustedFrequencies[letter] = adjustedFrequencies[letter] * 0.3; // Reduce by 70%
      }
    });
    
    // Calculate total weight after adjustments
    const totalWeight = Object.values(adjustedFrequencies).reduce((sum, weight) => sum + weight, 0);
    
    // Generate a random value between 0 and the total weight
    let random = Math.random() * totalWeight;
    let selectedLetter = 'E'; // Default in case something goes wrong
    
    // Find which letter corresponds to the random value
    for (const [letter, weight] of Object.entries(adjustedFrequencies)) {
      random -= weight;
      if (random <= 0) {
        selectedLetter = letter;
        break;
      }
    }
    
    // Update recent letters (keep only the last 2)
    setRecentLetters(prev => {
      const updated = [selectedLetter, ...prev];
      return updated.slice(0, 2);
    });
    
    return selectedLetter;
  };

  useEffect(() => {
    // Initialize with exactly 3 tiles
    const initialTiles = Array(3).fill().map(() => getRandomLetter());
    console.log('Initial next tiles:', initialTiles);
    setNextTiles(initialTiles);
  }, []);

  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const tick = setInterval(() => {
      moveTileDown();
    }, TICK_SPEED);

    return () => clearInterval(tick);
  }, [position, gameOver, isPaused]);

  const checkWord = (word) => {
    return words.includes(word.toLowerCase());
  };

  // Add this line to define the sound reference
  const wordSoundRef = useRef(new Audio('/sounds/word-success.mp3'));
  
  const checkWords = (x, y) => {
    let longestHorizontal = '';
    let longestVertical = '';
    let totalScore = 0;
    const cellsToClear = new Set();
  
    // Check horizontal words
    let left = x;
    while (left >= 0 && grid[y][left]) left--;
    left++;
  
    let right = x;
    while (right < GRID_WIDTH && grid[y][right]) right++;
  
    // Find all possible horizontal words and keep the longest valid one
    for (let start = left; start < right; start++) {
      for (let end = start + 3; end < right; end++) {  // Changed from +2 to +3 for minimum 4 letters
        const word = grid[y].slice(start, end + 1).join('');
        if (word.length >= 4 && checkWord(word) && word.length > longestHorizontal.length) {  // Changed from >=3 to >=4
          longestHorizontal = word;
        }
      }
    }
  
    // Check vertical words
    let top = y;
    while (top >= 0 && grid[top][x]) top--;
    top++;
  
    let bottom = y;
    while (bottom < GRID_HEIGHT && grid[bottom][x]) bottom++;
  
    // Find all possible vertical words and keep the longest valid one
    for (let start = top; start < bottom; start++) {
      for (let end = start + 3; end < bottom; end++) {  // Changed from +2 to +3 for minimum 4 letters
        const word = Array(end - start + 1).fill()
          .map((_, i) => grid[start + i][x]).join('');
        if (word.length >= 4 && checkWord(word) && word.length > longestVertical.length) {  // Changed from >=3 to >=4
          longestVertical = word;
        }
      }
    }
  
    // Process the longest words found
    const wordsFound = [];
    if (longestHorizontal) {
      wordsFound.push(longestHorizontal);
      totalScore += longestHorizontal.length * LETTER_POINTS;
      
      // Modify this to handle errors properly
      try {
        wordSoundRef.current.play();
      } catch (e) {
        console.log('Error playing sound:', e);
      }
      
      // Find the exact start position of the horizontal word
      let horizontalStart = left;
      for (let i = left; i <= right - longestHorizontal.length; i++) {
        const candidate = grid[y].slice(i, i + longestHorizontal.length).join('');
        if (candidate === longestHorizontal) {
          horizontalStart = i;
          break;
        }
      }
      
      // Mark horizontal word cells for clearing
      for (let i = horizontalStart; i < horizontalStart + longestHorizontal.length; i++) {
        cellsToClear.add(`${y},${i}`);
      }
    }
  
    if (longestVertical) {
      wordsFound.push(longestVertical);
      totalScore += longestVertical.length * LETTER_POINTS;
      
      // Modify this to handle errors properly
      if (!longestHorizontal) {
        try {
          wordSoundRef.current.play();
        } catch (e) {
          console.log('Error playing sound:', e);
        }
      }
      
      // Find the exact start position of the vertical word
      let verticalStart = top;
      for (let i = top; i <= bottom - longestVertical.length; i++) {
        const candidate = Array(longestVertical.length).fill()
          .map((_, j) => grid[i + j][x]).join('');
        if (candidate === longestVertical) {
          verticalStart = i;
          break;
        }
      }
      
      // Mark vertical word cells for clearing
      for (let i = verticalStart; i < verticalStart + longestVertical.length; i++) {
        cellsToClear.add(`${i},${x}`);
      }
    }
  
    // Apply combo multiplier
    if (wordsFound.length > 0) {
      totalScore *= (1 + combo * 0.5);
      setCombo(prev => prev + 1);
      
      // Set cleared cells for visual feedback
      setClearedCells(cellsToClear);
      
      // Clear the visual feedback after a delay
      setTimeout(() => {
        setClearedCells(new Set());
      }, 300);
      
      // Add the new words to our found words list
      setFoundWords(prev => [...wordsFound, ...prev].slice(0, 20)); // Keep only the 20 most recent words
      
      // Clear all marked cells
      const newGrid = [...grid];
      cellsToClear.forEach(cell => {
        const [y, x] = cell.split(',').map(Number);
        newGrid[y][x] = null;
      });
  
      // Apply gravity
      for (let col = 0; col < GRID_WIDTH; col++) {
        // Count empty spaces and shift tiles down
        const colTiles = [];
        
        // Collect all non-null tiles in this column
        for (let row = 0; row < GRID_HEIGHT; row++) {
          if (newGrid[row][col]) {
            colTiles.push(newGrid[row][col]);
            newGrid[row][col] = null;
          }
        }
        
        // Place tiles at the bottom of the grid
        let currentRow = GRID_HEIGHT - 1;
        for (let i = colTiles.length - 1; i >= 0; i--) {
          newGrid[currentRow][col] = colTiles[i];
          currentRow--;
        }
      }
  
      setGrid(newGrid);
      setScore(prev => prev + totalScore);
      return true;
    }
  
    setCombo(0);
    return false;
  };

  const placeTile = () => {
    if (!currentTile) return;
    
    // Store the position for word checking
    const placedX = position.x;
    const placedY = position.y;
    
    // Create a new grid with the placed tile
    const newGrid = [...grid];
    newGrid[placedY][placedX] = currentTile;
    
    // Update the grid first
    setGrid(newGrid);
    
    // Clear the current tile reference
    setCurrentTile(null);
    
    // Check for words after the grid is updated
    // Use the stored position values instead of the state which might have changed
    setTimeout(() => {
      checkWords(placedX, placedY);
      
      // Check game over condition
      if (placedY <= 1) {
        setGameOver(true);
      }
      
      // Automatically spawn a new tile after placement
      // This is the key fix - we need to get a new tile from nextTiles
      if (!gameOver) {
        const newTile = nextTiles[0];
        setCurrentTile(newTile);
        
        // Update the next tiles queue
        let updatedNextTiles;
        if (nextTiles.length <= 1) {
          updatedNextTiles = Array(3).fill().map(() => getRandomLetter());
        } else {
          updatedNextTiles = [...nextTiles.slice(1), getRandomLetter()];
        }
        
        setNextTiles(updatedNextTiles);
        setPosition({ x: Math.floor(GRID_WIDTH/2), y: 0 });
      }
    }, 10); // Small delay to ensure state updates have processed
  };

  const moveTileDown = useCallback(() => {
    if (!currentTile) {
      // Only handle the initial tile if there isn't one already
      const newTile = nextTiles[0];
      setCurrentTile(newTile);
      
      // Make sure we maintain 3 tiles in the queue
      let updatedNextTiles;
      if (nextTiles.length <= 1) {
        // If we're down to 1 or 0 tiles, regenerate a full set of 3
        updatedNextTiles = Array(3).fill().map(() => getRandomLetter());
      } else {
        // Otherwise, remove the first and add a new one at the end
        updatedNextTiles = [...nextTiles.slice(1), getRandomLetter()];
      }
      
      console.log('Updated next tiles:', updatedNextTiles);
      setNextTiles(updatedNextTiles);
      setPosition({ x: Math.floor(GRID_WIDTH/2), y: 0 });
      return;
    }
  
    // Immediately place tile if can't move down
    if (position.y === GRID_HEIGHT - 1 || grid[position.y + 1][position.x]) {
      placeTile();
      return;
    }
  
    setPosition(prev => ({ ...prev, y: prev.y + 1 }));
  }, [currentTile, position, grid, nextTiles]);

  const moveTileLeft = useCallback(() => {
    if (!currentTile) return;
    if (position.x > 0 && !grid[position.y][position.x - 1]) {
      setPosition(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentTile, position, grid]);

  const moveTileRight = useCallback(() => {
    if (!currentTile) return;
    if (position.x < GRID_WIDTH - 1 && !grid[position.y][position.x + 1]) {
      setPosition(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentTile, position, grid]);

  const hardDropTile = useCallback(() => {
    if (!currentTile) return;
    let dropY = position.y;
    while(dropY < GRID_HEIGHT - 1 && !grid[dropY + 1][position.x]) {
      dropY++;
    }
    if (dropY > position.y) {
      setPosition(prev => ({ ...prev, y: dropY }));
      setHardDrop(true);
    } else {
      placeTile();
    }
  }, [currentTile, position, grid, placeTile]);

  const handleKeyDown = useCallback((e) => {
    if (gameOver || isPaused) return;
    
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
  }, [position, grid, gameOver, moveTileDown, currentTile, isPaused, moveTileLeft, moveTileRight, hardDropTile]);

  useEffect(() => {
    if (hardDrop) {
      placeTile();
      setHardDrop(false);
    }
  }, [position, hardDrop]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const restartGame = () => {
    // Reset all game state
    setGrid(Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null)));
    setCurrentTile(null);
    setPosition({ x: Math.floor(GRID_WIDTH/2), y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setCombo(0);
    setHardDrop(false);
    setClearedCells(new Set());
    setFoundWords([]);
    
    // Generate new tiles
    const initialTiles = Array(3).fill().map(() => getRandomLetter());
    setNextTiles(initialTiles);
    setRecentLetters([]);
  };
  
  return (
    <div className="game-container">
      <ScoreDisplay score={score} combo={combo} />
      {/* NextTiles above the grid */}
      <NextTiles nextTiles={nextTiles} />
      
      <Grid 
        grid={grid} 
        position={position} 
        currentTile={currentTile} 
        clearedCells={clearedCells}
      />
      
      <div className="controls">
        <button onClick={() => moveTileLeft()}>←</button>
        <button onClick={() => hardDropTile()}>Drop</button>
        <button onClick={() => moveTileRight()}>→</button>
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={restartGame}>Restart</button>
      </div>
      
      {showWordList && <WordList words={foundWords} />}
      {gameOver && <div className="game-over">Game Over!</div>}
      {isPaused && <div className="pause-overlay">Paused</div>}
    </div>
  );
};

export default GameBoard;