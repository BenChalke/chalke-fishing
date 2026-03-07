// src/App.js
import React, { useState } from "react";
import FreePlayGame from "./FreePlayGame";
import TimeTrialGame from "./TimeTrialGame";
import SurvivalGame from "./SurvivalGame";
import HighScoreScreen from "./HighScoreScreen";
import InstructionsScreen from "./InstructionsScreen";
import FishField from "./components/FishField";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("home");
  const [ttKey, setTtKey] = useState(0);
  const [survivalKey, setSurvivalKey] = useState(0);

  const goHome = () => setMode("home");
  const goFree = () => setMode("free");
  const goTimeTrial = () => setMode("timeTrial");
  const goSurvival = () => setMode("survival");
  const goHighScore = () => setMode("highScore");
  const goInstructions = () => setMode("instructions");

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
            <div className="home-primary-block">
              <button className="home-btn-primary" onClick={goTimeTrial}>⏱ Time Trial</button>
              <p className="home-btn-desc">60 seconds — how many can you catch?</p>
            </div>
            <div className="home-secondary-row">
              <button className="home-btn-secondary" onClick={goSurvival}>☠ Survival</button>
              <button className="home-btn-secondary" onClick={goFree}>🎣 Free Fishing</button>
              <button className="home-btn-secondary" onClick={goHighScore}>🏆 High Scores</button>
            </div>
            <p className="home-free-desc">Free Fishing is just for fun — no timer, no pressure</p>
            <button className="home-how-to-play" onClick={goInstructions}>? How to Play</button>
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

  if (mode === "survival") {
    return <SurvivalGame
      key={survivalKey}
      onBackToHome={goHome}
      onPlayAgain={() => setSurvivalKey((k) => k + 1)}
    />;
  }

  if (mode === "highScore") {
    return <HighScoreScreen onBackToHome={goHome} />;
  }

  if (mode === "instructions") {
    return <InstructionsScreen onBackToHome={goHome} />;
  }

  return null;
}
