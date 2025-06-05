// src/App.js
import React, { useState } from "react";
import FreePlayGame from "./FreePlayGame";
import TimeTrialGame from "./TimeTrialGame"; // ← you presumably already have this
import HighScoreScreen from "./HighScoreScreen"; // ← (optional) for “High Score” mode
import FishField from "./components/FishField";
import "./App.css";
import "./FishingGame.css"; // ← add the new rules for .home-overlay, etc.

export default function App() {
  const [mode, setMode] = useState("home");

  const goHome = () => setMode("home");
  const goFree = () => setMode("free");
  const goTimeTrial = () => setMode("timeTrial");
  const goHighScore = () => setMode("highScore");

  if (mode === "home") {
    return (
      <div className="container no-cursor">
        {/* 1) Show 15 decorative fish + bubbles “behind” */}
        <FishField count={15} isInteractive={false} isMobile={false} />

        {/* 2) Semi-transparent overlay panel */}
        <div className="home-overlay">
          <h1>Chalke Fishing</h1>
          <div className="home-buttons">
            <button onClick={goFree}>Fishing</button>
            <button onClick={goTimeTrial}>Time Trial</button>
            <button onClick={goHighScore}>High Score</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "free") {
    return <FreePlayGame onBackToHome={goHome} />;
  }

  if (mode === "timeTrial") {
    return <TimeTrialGame onBackToHome={goHome} />;
  }

  if (mode === "highScore") {
    return <HighScoreScreen onBackToHome={goHome} />;
  }

  return null;
}
