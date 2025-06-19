import React, { useState } from 'react';
import GameBoard from './components/GameBoard.jsx';
import IntroOverlay from './components/IntroOverlay.jsx';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="App">
      <h1>Fallter</h1>
      {!gameStarted && <IntroOverlay onStartGame={handleStartGame} />}
      {gameStarted && <GameBoard />}
    </div>
  );
}

export default App;
