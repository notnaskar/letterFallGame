import React, { useEffect, useState } from 'react';
import './Countdown.css';

const Countdown = ({ count, onComplete }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Trigger animation by updating key
    setAnimationKey(prev => prev + 1);

    // Generate particles for visual effects
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 360) / 12,
      delay: i * 0.05,
    }));
    setParticles(newParticles);
  }, [count]);

  useEffect(() => {
    if (count === 0 && onComplete) {
      // Small delay before calling complete to let the animation finish
      const timer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  if (count === null || count < 0) return null;

  const getMessage = () => {
    if (count === 0) return 'GO!';
    return count;
  };

  const getColorClass = () => {
    if (count === 0) return 'go';
    if (count === 1) return 'warning';
    return 'normal';
  };

  return (
    <div className="countdown-overlay">
      <div className="countdown-backdrop" />
      
      <div className={`countdown-container ${getColorClass()}`} key={animationKey}>
        {/* Particle burst effects */}
        <div className="particle-container">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                '--angle': `${particle.angle}deg`,
                '--delay': `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Rotating rings */}
        <div className="rings-container">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
        </div>

        {/* Main countdown number/text */}
        <div className="countdown-content">
          <div className="countdown-number">
            {getMessage()}
          </div>
          
          {/* Progress ring */}
          <svg className="progress-ring" viewBox="0 0 200 200">
            <circle
              className="progress-ring-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className="progress-ring-fill"
              cx="100"
              cy="100"
              r="90"
              style={{
                '--progress': count === 0 ? 1 : (3 - count + 1) / 3,
              }}
            />
          </svg>
        </div>

        {/* Glow effect */}
        <div className="glow-effect" />
        
        {/* Pulse waves */}
        <div className="pulse-wave pulse-1" />
        <div className="pulse-wave pulse-2" />
        <div className="pulse-wave pulse-3" />
      </div>

      {/* Bottom message */}
      {count > 0 && (
        <div className="countdown-message">
          Get Ready!
        </div>
      )}
    </div>
  );
};

export default Countdown;
