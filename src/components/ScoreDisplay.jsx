import React from 'react';
import './GameBoard.css';

const ScoreDisplay = ({ score }) => {
  return (
    <>
      <div className="score-display">
        Score: {score}
      </div>
    </>
   
  );
};

export default ScoreDisplay;