// src/App.js
import React, { useState } from "react";
import FreePlayGame from "./FreePlayGame";
import TimeTrialGame from "./TimeTrialGame";
import SurvivalGame from "./SurvivalGame";
import TargetScoreGame from "./TargetScoreGame";
import HighScoreScreen from "./HighScoreScreen";
import InstructionsScreen from "./InstructionsScreen";
import FishField from "./components/FishField";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("home");
  const [ttKey, setTtKey] = useState(0);
  const [survivalKey, setSurvivalKey] = useState(0);
  const [tsKey, setTsKey] = useState(0);
  const [showModes, setShowModes] = useState(false);

  const goHome = () => { setMode("home"); setShowModes(false); };
  const goFree = () => setMode("free");
  const goTimeTrial = () => setMode("timeTrial");
  const goSurvival = () => setMode("survival");
  const goTargetScore = () => setMode("targetScore");
  const goHighScore = () => setMode("highScore");
  const goInstructions = () => setMode("instructions");

  if (mode === "home") {
    return (
      <div className="container">
        <div className="light-rays" />
        <div className="water-surface" />
        <FishField count={15} isInteractive={false} isMobile={false} />

        <div className="home-overlay">
          <h1>Chalke Fishing</h1>
          <p className="home-subtitle">Cast your line. Catch them all.</p>

          {!showModes ? (
            /* ── LANDING STATE ── */
            <div className="home-landing">
              <button className="home-btn-play" onClick={() => setShowModes(true)}>
                ▶ Play
              </button>
              <div className="home-util-row">
                <button className="home-util-btn" onClick={goHighScore}>🏆 High Scores</button>
                <button className="home-util-btn" onClick={goInstructions}>? How to Play</button>
              </div>
            </div>
          ) : (
            /* ── MODE SELECTION STATE ── */
            <div className="home-modes">
              <p className="home-modes-label">Choose a mode</p>
              <div className="home-mode-cards">
                <button className="home-mode-card home-mode-card-primary" onClick={goTimeTrial}>
                  <span className="home-mode-icon">⏱</span>
                  <span className="home-mode-name">Time Trial</span>
                  <span className="home-mode-desc">60 seconds — catch as many as you can</span>
                </button>
                <button className="home-mode-card" onClick={goSurvival}>
                  <span className="home-mode-icon">☠</span>
                  <span className="home-mode-name">Survival</span>
                  <span className="home-mode-desc">Don't click the skull fish. How long can you last?</span>
                </button>
                <button className="home-mode-card" onClick={goTargetScore}>
                  <span className="home-mode-icon">🎯</span>
                  <span className="home-mode-name">Target Score</span>
                  <span className="home-mode-desc">Hit the target each level before time runs out.</span>
                </button>
                <button className="home-mode-card home-mode-card-casual" onClick={goFree}>
                  <span className="home-mode-icon">🎣</span>
                  <span className="home-mode-name">Free Fishing</span>
                  <span className="home-mode-desc">No timer, no pressure. Just explore.</span>
                </button>
              </div>
              <button className="home-back-link" onClick={() => setShowModes(false)}>← Back</button>
            </div>
          )}
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

  if (mode === "targetScore") {
    return <TargetScoreGame
      key={tsKey}
      onBackToHome={goHome}
      onPlayAgain={() => setTsKey((k) => k + 1)}
      onGoHighScore={goHighScore}
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
