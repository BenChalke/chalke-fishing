// src/HighScoreScreen.js
import React, { useEffect, useState } from "react";
import "./HighScoreScreen.css";
import "./components/StatsPopup.css";
import Fish from "./components/Fish";
import FishField from "./components/FishField";
import { RARE_COLOURS, SUPER_COLOURS } from "./constants/fishConstants";
import { leaderboardEnabled, getScores } from "./utils/leaderboard";

function readSavedHighScore() {
  try {
    const saved = localStorage.getItem("ttHighScore");
    if (saved) {
      const parsed = JSON.parse(saved);
      // backwards compat: convert old array format to tally object
      if (Array.isArray(parsed.records)) {
        parsed.records = parsed.records.reduce((acc, t) => {
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
      }
      return parsed;
    }
  } catch {}
  return { score: 0, records: {} };
}

function normalizeTally(records) {
  if (!records) return {};
  if (Array.isArray(records)) {
    return records.reduce((acc, t) => {
      if (typeof t === 'string') acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  }
  return records;
}

function FishTally({ records }) {
  const entries = Object.entries(normalizeTally(records));
  if (entries.length === 0) return <p className="no-fish-text">No fish recorded.</p>;

  const superRare = entries.filter(([t]) => SUPER_COLOURS.includes(t.split(' ')[0])).sort((a, b) => a[0].localeCompare(b[0]));
  const rare      = entries.filter(([t]) => RARE_COLOURS.includes(t.split(' ')[0])).sort((a, b) => a[0].localeCompare(b[0]));
  const common    = entries.filter(([t]) =>
    !SUPER_COLOURS.includes(t.split(' ')[0]) && !RARE_COLOURS.includes(t.split(' ')[0])
  ).sort((a, b) => a[0].localeCompare(b[0]));

  const renderGroup = (label, group) => group.length === 0 ? null : (
    <div className="stats-section">
      <h3><strong>{label}</strong></h3>
      <ul>
        {group.map(([typeStr, count]) => {
          const [colour, pattern] = typeStr.split(' ');
          return (
            <li key={typeStr}>
              <div className="mini-fish-container">
                <Fish x={0} y={0} size={40} colour={colour} pattern={pattern} isMobile={false} />
              </div>
              <span className="stat-fish-type">{typeStr}</span>
              <span className="stat-count">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {renderGroup('Super Rare', superRare)}
      {renderGroup('Rare', rare)}
      {renderGroup('Common', common)}
    </>
  );
}

export default function HighScoreScreen({ onBackToHome }) {
  const [highScore]   = useState(() => readSavedHighScore().score   || 0);
  const [highRecords] = useState(() => readSavedHighScore().records || []);
  const [isMobile, setIsMobile] = useState(false);

  const [tab, setTab] = useState('local');
  const [globalScores, setGlobalScores] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);

  useEffect(() => {
    if (tab !== 'global' || !leaderboardEnabled) return;
    setGlobalLoading(true);
    setGlobalError('');
    setExpandedRow(null);
    getScores('timeTrial')
      .then((scores) => setGlobalScores(scores))
      .catch(() => setGlobalError('Could not load scores'))
      .finally(() => setGlobalLoading(false));
  }, [tab]);

  const toggleRow = (i) => setExpandedRow((prev) => (prev === i ? null : i));

  const renderRow = (rank, name, score, records, i) => (
    <li key={i}>
      <div className="hs-global-row">
        <span className="hs-rank">#{rank}</span>
        <span className="hs-name">{name}</span>
        <span className="hs-pts">{score.toLocaleString()} pts</span>
        {records && (Array.isArray(records) ? records.length > 0 : Object.keys(records).length > 0) && (
          <button className="hs-fish-btn" onClick={() => toggleRow(i)}>
            {expandedRow === i ? '▲' : '🐟'}
          </button>
        )}
      </div>
      {expandedRow === i && (
        <div className="hs-fish-expand">
          <FishTally records={records} />
        </div>
      )}
    </li>
  );

  return (
    <div className="container">
      <FishField count={0} isInteractive={false} isMobile={isMobile} />
      <button className="back-home-btn" onClick={onBackToHome}>←</button>

      <div className="highscore-header">
        <h2>Time-Trial High Score: {highScore}</h2>
      </div>

      {leaderboardEnabled && (
        <div className="hs-tab-bar">
          <button
            className={`hs-tab${tab === 'local' ? ' hs-tab-active' : ''}`}
            onClick={() => { setTab('local'); setExpandedRow(null); }}
          >
            Local
          </button>
          <button
            className={`hs-tab${tab === 'global' ? ' hs-tab-active' : ''}`}
            onClick={() => setTab('global')}
          >
            Global
          </button>
        </div>
      )}

      <div className="stats-container">
        {tab === 'global' && leaderboardEnabled ? (
          <>
            {globalLoading && <p className="no-fish-text">Loading…</p>}
            {globalError   && <p className="no-fish-text hs-error">{globalError}</p>}
            {!globalLoading && !globalError && globalScores.length === 0 && (
              <p className="no-fish-text">No scores yet. Be the first!</p>
            )}
            {!globalLoading && !globalError && globalScores.length > 0 && (
              <ol className="hs-global-list">
                {globalScores.map((entry, i) =>
                  renderRow(i + 1, entry.playerName, entry.score, entry.records ?? [], i)
                )}
              </ol>
            )}
          </>
        ) : (
          <ol className="hs-global-list">
            {highScore > 0
              ? renderRow(1, 'Your Best', highScore, highRecords, 0)
              : <p className="no-fish-text">No local high score yet. Play Time Trial!</p>
            }
          </ol>
        )}
      </div>
    </div>
  );
}
