import React, { useState } from "react";
import GameBoard from "./components/GameBoard.jsx";
import IntroOverlay from "./components/IntroOverlay.jsx";
import "./App.css";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="App">
      {!gameStarted && <IntroOverlay onStartGame={handleStartGame} />}
      <div className="game-wrapper glass-panel">
        <h1>Fallter</h1>
        {gameStarted && <GameBoard />}
      </div>
    </div>
  );
}

export default App;
