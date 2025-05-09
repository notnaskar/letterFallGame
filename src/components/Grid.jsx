import React from 'react';
import './GameBoard.css';

const Grid = ({ grid, position = { x: 0, y: 0 }, currentTile, clearedCells = new Set() }) => {
  return (
    <div className="grid">
      {grid.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => {
            const isCurrentPosition = x === position.x && y === position.y;
            const isCleared = clearedCells.has(`${y},${x}`);
            
            return (
              <div 
                key={x} 
                className={`cell ${cell ? 'filled' : ''} ${isCurrentPosition && currentTile ? 'current' : ''} ${isCleared ? 'cleared' : ''}`}
              >
                {isCurrentPosition && currentTile ? currentTile : cell}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;