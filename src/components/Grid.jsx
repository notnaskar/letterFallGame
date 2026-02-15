import React, { memo } from 'react';
import './GameBoard.css';

const Grid = memo(({ grid, position = { x: 0, y: 0 }, currentTile, clearedCells = new Set(), ghostPosition = null }) => {
  return (
    <div className="grid">
      {grid.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => {
            const isCurrentPosition = x === position.x && y === position.y;
            const isGhostPosition = ghostPosition && x === ghostPosition.x && y === ghostPosition.y && !isCurrentPosition;
            const isCleared = clearedCells.has(`${y},${x}`);
            const isShape = cell === '#';
            const displayCell = isShape ? '' : cell;

            return (
              <div
                key={x}
                className={`cell ${cell ? 'filled' : ''} ${isShape ? 'countdown-shape' : ''} ${isCurrentPosition && currentTile ? 'current' : ''} ${isGhostPosition && currentTile ? 'ghost' : ''} ${isCleared ? 'cleared' : ''}`}
              >
                {isCurrentPosition && currentTile ? currentTile : (isGhostPosition && currentTile ? currentTile : displayCell)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

Grid.displayName = 'Grid';

export default Grid;