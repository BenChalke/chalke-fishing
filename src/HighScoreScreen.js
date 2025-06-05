// src/components/HighScoreScreen.js

import React, { useState, useEffect } from 'react';
import StatsPopup from './components/StatsPopup';
import Fish from './components/Fish';
import {
  COLOURS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from './constants/fishConstants';

export default function HighScoreScreen({ onBackToHome }) {
  const [highData, setHighData] = useState({ score: 0, records: [] });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ttHighScore')) || null;
    if (saved) {
      setHighData(saved);
    }
  }, []);

  // Build tally
  const { score, records } = highData;
  const tally = records.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  // Split by rarity, etc. for StatsPopup
  return (
    <div className="container no-cursor">
      <button
        className="back-home-btn"
        onClick={onBackToHome}
      >
        ← Home
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '80px',
          color: 'white',
        }}
      >
        <h2>Time Trial High Score</h2>
        <p style={{ fontSize: '1.2rem' }}>Score: {score}</p>
        <button
          className="caught-btn"
          onClick={() => setShowPopup(true)}
          style={{
            marginTop: '12px',
            background: '#fffae6',
            border: '2px solid #f2c94c',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#333',
          }}
        >
          See High Score Fish
        </button>
      </div>

      {showPopup && (
        <StatsPopup
          caughtRecords={records}
          tally={tally}
          isMobile={false}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
