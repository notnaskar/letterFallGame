export const COUNTDOWN_PATTERNS = {
  3: [
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  2: [
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1]
  ],
  1: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0]
  ],
  0: [
    // "GO" pattern - 9 wide, 5 high
    // G (4 wide) - Space (1) - O (4 wide)
    [0, 1, 1, 0, 0, 0, 1, 1, 0], 
    [1, 0, 0, 0, 0, 1, 0, 0, 1], 
    [1, 0, 1, 1, 0, 1, 0, 0, 1], 
    [1, 0, 0, 1, 0, 1, 0, 0, 1], 
    [0, 1, 1, 1, 0, 0, 1, 1, 0]  
  ]
};

export const getCountdownGrid = (number, width = 9, height = 9) => {
  const pattern = COUNTDOWN_PATTERNS[number];
  if (!pattern) return null;

  const emptyGrid = Array(height).fill().map(() => Array(width).fill(null));
  
  const patternHeight = pattern.length;
  const patternWidth = pattern[0].length;
  
  const startX = Math.floor((width - patternWidth) / 2);
  const startY = Math.floor((height - patternHeight) / 2);

  pattern.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 1) {
        const gridY = startY + r;
        const gridX = startX + c;
        
        if (emptyGrid[gridY] && emptyGrid[gridY][gridX] !== undefined) {
          emptyGrid[gridY][gridX] = '#'; // Special marker for countdown cells
        }
      }
    });
  });

  return emptyGrid;
};
