// src/App.js
import React, { useState } from "react";
import FreePlayGame from "./FreePlayGame";
import TimeTrialGame from "./TimeTrialGame";
import HighScoreScreen from "./HighScoreScreen";
import FishField from "./components/FishField";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("home");
  const [ttKey, setTtKey] = useState(0);

  const goHome = () => setMode("home");
  const goFree = () => setMode("free");
  const goTimeTrial = () => setMode("timeTrial");
  const goHighScore = () => setMode("highScore");

  // Otherwise, render the rest of the app
  if (mode === "home") {
    return (
      <div className="container">
        {/* Environment overlays */}
        <div className="light-rays" />
        <div className="water-surface" />
        {/* <div className="seabed" /> */}

        {/* 1) Show 15 decorative fish + bubbles "behind" */}
        <FishField count={15} isInteractive={false} isMobile={false} />

        {/* 2) Semi-transparent overlay panel */}
        <div className="home-overlay">
          <h1>Chalke Fishing</h1>
          <p className="home-subtitle">Cast your line. Catch them all.</p>
          <div className="home-buttons">
            <button onClick={goFree}>🎣 Fishing</button>
            <button onClick={goTimeTrial}>⏱ Time Trial</button>
            <button onClick={goHighScore}>🏆 High Score</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "free") {
    return <FreePlayGame onBackToHome={goHome} />;
  }

  if (mode === "timeTrial") {
    return <TimeTrialGame
      key={ttKey}
      onBackToHome={goHome}
      onPlayAgain={() => setTtKey((k) => k + 1)}
      onGoHighScore={goHighScore}
    />;
  }

  if (mode === "highScore") {
    return <HighScoreScreen onBackToHome={goHome} />;
  }

  return null;
}
