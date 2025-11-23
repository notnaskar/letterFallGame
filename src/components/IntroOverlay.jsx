import React from 'react';
import './IntroOverlay.css';
import { FaArrowLeft, FaArrowRight, FaArrowDown, FaKeyboard, FaPlay, FaTrophy, FaRedo } from 'react-icons/fa';

const IntroOverlay = ({ onStartGame, isResume = false }) => {
  return (
    <div className="intro-overlay">
      <div className="intro-card glass-panel">
        <div className="intro-header">
          <h1 className="game-title">Fallter</h1>
          <p className="tagline">Unscramble. Drop. Conquer.</p>
        </div>

        <div className="intro-body">
          <section className="info-group">
            <h3><FaTrophy className="icon-accent" /> Objective</h3>
            <p>Form words of <strong>4+ letters</strong> horizontally or vertically to clear tiles and score points.</p>
          </section>

          <section className="info-group">
            <h3><FaKeyboard className="icon-accent" /> Controls</h3>
            <div className="controls-preview">
              <div className="control-row">
                <div className="key-group">
                  <kbd><FaArrowLeft /></kbd>
                  <kbd><FaArrowRight /></kbd>
                </div>
                <span>Move</span>
              </div>
              <div className="control-row">
                <div className="key-group">
                  <kbd><FaArrowDown /></kbd>
                </div>
                <span>Soft Drop</span>
              </div>
              <div className="control-row">
                <div className="key-group">
                  <kbd className="wide">Space</kbd>
                </div>
                <span>Hard Drop</span>
              </div>
            </div>
          </section>
        </div>

        <div className="intro-footer">
          <button onClick={onStartGame} className="start-button">
            {isResume ? <FaRedo /> : <FaPlay />}
            {isResume ? ' Resume Game' : ' Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroOverlay;