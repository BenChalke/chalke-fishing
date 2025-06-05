// src/App.js
import React, { useState, useEffect } from "react";
import FreePlayGame from "./FreePlayGame";
import TimeTrialGame from "./TimeTrialGame";
import HighScoreScreen from "./HighScoreScreen";
import FishField from "./components/FishField";
import WelcomePopup from "./components/WelcomePopup";
import "./App.css";
// import "./TimeTrialGame.css";

export default function App() {
  const [mode, setMode] = useState("home");
  const [showWelcome, setShowWelcome] = useState(false);

  // On mount, decide whether to display the welcome popup
  useEffect(() => {
    const seen = localStorage.getItem("seenWelcome");
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem("seenWelcome", "true");
    setShowWelcome(false);
  };

  const goHome = () => setMode("home");
  const goFree = () => setMode("free");
  const goTimeTrial = () => setMode("timeTrial");
  const goHighScore = () => setMode("highScore");

  // If the welcome popup should be shown, render it above everything else
  if (showWelcome) {
    return <WelcomePopup onClose={handleCloseWelcome} />;
  }

  // Otherwise, render the rest of the app
  if (mode === "home") {
    return (
      <div className="container">
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
