import React, { useState, Suspense } from "react";
// Lazy load GameBoard to split the heavy word dictionary from the main bundle
const GameBoard = React.lazy(() => import("./components/GameBoard.jsx"));
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
        {gameStarted && (
          <Suspense fallback={<div className="loading-state">Loading Game Resources...</div>}>
            <GameBoard />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default App;
