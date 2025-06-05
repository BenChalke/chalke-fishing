// src/App.js
import React, { useState } from 'react';
import './App.css';

import FreePlayGame   from './components/FreePlayGame';
import TimeTrialGame  from './components/TimeTrialGame';
import HighScoreGame  from './components/HighScoreGame';

export default function App() {
  // mode: 'home' → show home screen, 'free' → FreePlayGame, 'timeTrial' → TimeTrialGame, 'highScore' → HighScoreGame
  const [mode, setMode] = useState('home');

  const goHome = () => setMode('home');
  const startFree = () => setMode('free');
  const startTrial = () => setMode('timeTrial');
  const viewHigh = () => setMode('highScore');

  // HOME screen UI
  if (mode === 'home') {
    return (
      <div className="container">
        <h1
          style={{
            textAlign: 'center',
            color: 'white',
            marginTop: '40px',
            fontSize: '3rem',
          }}
        >
          Chalke Fishing
        </h1>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <button
            onClick={startFree}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Fishing
          </button>
          <button
            onClick={startTrial}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Time Trial
          </button>
          <button
            onClick={viewHigh}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            High Score
          </button>
        </div>
      </div>
    );
  }

  // FREE PLAY mode
  if (mode === 'free') {
    return <FreePlayGame onBackToHome={goHome} />;
  }

  // TIME TRIAL mode
  if (mode === 'timeTrial') {
    return <TimeTrialGame onBackToHome={goHome} />;
  }

  // HIGH SCORE mode
  if (mode === 'highScore') {
    return <HighScoreGame onBackToHome={goHome} />;
  }

  return null;
}
