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
        <div className="header">
          <h1>Fallter</h1>
          <p style={{ margin: "0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Made with ❤️ by <a style={{ color: "var(--text-secondary)" }} target="_blank" href="https://www.linkedin.com/in/akash-naskar2/">Akash Naskar</a></p>
        </div>
        {gameStarted && <GameBoard />}
      </div>
    </div>
  );
}

export default App;
