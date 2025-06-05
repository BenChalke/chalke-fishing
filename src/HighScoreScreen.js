// src/HighScoreScreen.jsx
import React, { useEffect, useState } from "react";
import "./HighScoreScreen.css";
import "./components/StatsPopup.css"; // reuse list‐formatting styles
import Fish from "./components/Fish";
import { RARE_COLOURS, SUPER_COLOURS } from "./constants/fishConstants";

export default function HighScoreScreen({ onBackToHome }) {
  const [highScore, setHighScore] = useState(0);
  const [highRecords, setHighRecords] = useState([]);

  // On mount: read the single “ttHighScore” entry from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ttHighScore");
      if (saved) {
        const parsed = JSON.parse(saved);
        setHighScore(parsed.score || 0);
        setHighRecords(parsed.records || []);
      }
    } catch {
      setHighScore(0);
      setHighRecords([]);
    }
  }, []);

  // Build tally: { "colour pattern": count }
  const tally = highRecords.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(tally);

  const superRareEntries = entries.filter(([typeStr]) => {
    const colour = typeStr.split(" ")[0];
    return SUPER_COLOURS.includes(colour);
  });
  const rareEntries = entries.filter(([typeStr]) => {
    const colour = typeStr.split(" ")[0];
    return RARE_COLOURS.includes(colour);
  });
  const commonEntries = entries.filter(([typeStr]) => {
    const colour = typeStr.split(" ")[0];
    return !SUPER_COLOURS.includes(colour) && !RARE_COLOURS.includes(colour);
  });

  superRareEntries.sort((a, b) => a[0].localeCompare(b[0]));
  rareEntries.sort((a, b) => a[0].localeCompare(b[0]));
  commonEntries.sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="container">
      {/* Back to Home button (top-left) */}
      <button className="back-home-btn" onClick={onBackToHome}>
        ← Home
      </button>

      <div className="highscore-header">
        <h2>Time-Trial High Score: {highScore}</h2>
      </div>

      <div className="stats-container">
        {/* Super Rare */}
        {superRareEntries.length > 0 && (
          <div className="stats-section">
            <h3><strong>Super Rare</strong></h3>
            <ul>
              {superRareEntries.map(([typeStr, count]) => {
                const [colour, pattern] = typeStr.split(" ");
                return (
                  <li key={typeStr} className="caught-item">
                    <div className="mini-fish-container">
                      <Fish
                        x={0}
                        y={0}
                        size={40}
                        colour={colour}
                        pattern={pattern}
                        isMobile={false}
                      />
                    </div>
                    <span className="stat-fish-type"><strong>{typeStr}</strong></span>
                    <span className="stat-count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Rare */}
        {rareEntries.length > 0 && (
          <div className="stats-section">
            <h3><strong>Rare</strong></h3>
            <ul>
              {rareEntries.map(([typeStr, count]) => {
                const [colour, pattern] = typeStr.split(" ");
                return (
                  <li key={typeStr} className="caught-item">
                    <div className="mini-fish-container">
                      <Fish
                        x={0}
                        y={0}
                        size={40}
                        colour={colour}
                        pattern={pattern}
                        isMobile={false}
                      />
                    </div>
                    <span className="stat-fish-type"><strong>{typeStr}</strong></span>
                    <span className="stat-count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Common */}
        {commonEntries.length > 0 && (
          <div className="stats-section">
            <h3>Common</h3>
            <ul>
              {commonEntries.map(([typeStr, count]) => {
                const [colour, pattern] = typeStr.split(" ");
                return (
                  <li key={typeStr} className="caught-item">
                    <div className="mini-fish-container">
                      <Fish
                        x={0}
                        y={0}
                        size={40}
                        colour={colour}
                        pattern={pattern}
                        isMobile={false}
                      />
                    </div>
                    <span className="stat-fish-type">{typeStr}</span>
                    <span className="stat-count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {highRecords.length === 0 && (
          <p className="no-fish-text">
            No fish recorded for the high score yet.
          </p>
        )}
      </div>
    </div>
  );
}
