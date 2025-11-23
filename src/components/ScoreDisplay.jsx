import React from 'react';
import './GameBoard.css';

const ScoreDisplay = ({ score, combo }) => {
  return (
    <div className="score-container glass-panel">
      <div className="score-value">
        <span className="score-label">SCORE</span>
        <span className="score-number">{score}</span>
      </div>
      {combo > 0 && (
        <div className="combo-badge">
          {combo}x COMBO!
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;