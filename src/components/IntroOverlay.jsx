import React from 'react';
import './IntroOverlay.css';
import { FaArrowLeft, FaArrowRight, FaArrowDown, FaKeyboard, FaPlay } from 'react-icons/fa';

const IntroOverlay = ({ onStartGame }) => {
  return (
    <div className="intro-overlay">
      <div className="intro-content glow">
        <h1>Fallter</h1>
        <p className="tagline">Unscramble, Drop, Conquer!</p>

        <section className="game-info-section">
          <h2>How to Play</h2>
          <ul className="game-rules">
            <li><FaArrowDown className="rule-icon"/> Drop letters to build words.</li>
            <li><FaKeyboard className="rule-icon"/> Form 4+ letter words horizontally or vertically.</li>
            <li><FaPlay className="rule-icon"/> Clear words, score points, avoid the top!</li>
          </ul>
        </section>

        <section className="game-info-section">
          <h2>Controls</h2>
          <div className="control-grid minimal-controls">
            <div className="control-item">
              <span className="control-key"><FaArrowLeft /><FaArrowRight /></span>
              <span className="control-action">Move</span>
            </div>
            <div className="control-item">
              <span className="control-key"><FaArrowDown /></span>
              <span className="control-action">Drop</span>
            </div>
            <div className="control-item">
              <span className="control-key">Space</span>
              <span className="control-action">Hard Drop</span>
            </div>
            <div className="control-item">
              <span className="control-key">P</span>
              <span className="control-action">Pause</span>
            </div>
          </div>
        </section>

        <button onClick={onStartGame} className="start-game-button pulsating-button">
          Start Game
        </button>
      </div>
    </div>
  );
};

export default IntroOverlay; 