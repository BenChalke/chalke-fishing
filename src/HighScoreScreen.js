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

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function readSavedSurvivalScore() {
  try {
    const saved = localStorage.getItem('survivalHighScore');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { time: 0, score: 0, records: {} };
}

export default function HighScoreScreen({ onBackToHome }) {
  const [isMobile, setIsMobile] = useState(false);

  // Which game mode are we viewing
  const [gameMode, setGameMode] = useState('timeTrial');

  // Local scores
  const [ttLocal]       = useState(() => readSavedHighScore());
  const [survivalLocal] = useState(() => readSavedSurvivalScore());

  // Global scores
  const [leaderTab, setLeaderTab]     = useState('local');
  const [globalScores, setGlobalScores] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError]   = useState('');
  const [expandedRow, setExpandedRow]   = useState(null);

  useEffect(() => { setIsMobile('ontouchstart' in window); }, []);

  useEffect(() => {
    if (leaderTab !== 'global' || !leaderboardEnabled) return;
    setGlobalLoading(true);
    setGlobalError('');
    setGlobalScores([]);
    setExpandedRow(null);
    getScores(gameMode)
      .then((scores) => setGlobalScores(scores))
      .catch(() => setGlobalError('Could not load scores'))
      .finally(() => setGlobalLoading(false));
  }, [leaderTab, gameMode]);

  const switchGameMode = (m) => {
    setGameMode(m);
    setLeaderTab('local');
    setExpandedRow(null);
    setGlobalScores([]);
    setGlobalError('');
  };

  const toggleRow = (i) => setExpandedRow((prev) => (prev === i ? null : i));

  const renderRow = (rank, name, primaryScore, records, i, pointsScore) => {
    const isSurvival = gameMode === 'survival';
    const scoreLabel = isSurvival
      ? formatTime(primaryScore)
      : `${primaryScore.toLocaleString()} pts`;
    const subLabel = isSurvival && pointsScore != null
      ? `${pointsScore.toLocaleString()} pts`
      : null;
    const hasRecords = records && (Array.isArray(records) ? records.length > 0 : Object.keys(records).length > 0);

    return (
      <li key={i}>
        <div className="hs-global-row">
          <span className="hs-rank">#{rank}</span>
          <span className="hs-name">{name}</span>
          <span className="hs-pts">
            {scoreLabel}
            {subLabel && <span className="hs-sub-pts"> · {subLabel}</span>}
          </span>
          {hasRecords && (
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
  };

  const renderLocal = () => {
    if (gameMode === 'timeTrial') {
      return ttLocal.score > 0
        ? renderRow(1, 'Your Best', ttLocal.score, ttLocal.records, 0, null)
        : <p className="no-fish-text">No local high score yet. Play Time Trial!</p>;
    }
    return survivalLocal.time > 0
      ? renderRow(1, 'Your Best', survivalLocal.time, survivalLocal.records, 0, survivalLocal.score)
      : <p className="no-fish-text">No local high score yet. Play Survival!</p>;
  };

  return (
    <div className="container">
      <FishField count={0} isInteractive={false} isMobile={isMobile} />
      <button className="back-home-btn" onClick={onBackToHome}>←</button>

      <div className="highscore-header">
        <h2>Leaderboard</h2>
      </div>

      {/* Game mode selector */}
      <div className="hs-tab-bar">
        <button
          className={`hs-tab${gameMode === 'timeTrial' ? ' hs-tab-active' : ''}`}
          onClick={() => switchGameMode('timeTrial')}
        >
          ⏱ Time Trial
        </button>
        <button
          className={`hs-tab${gameMode === 'survival' ? ' hs-tab-active' : ''}`}
          onClick={() => switchGameMode('survival')}
        >
          ☠ Survival
        </button>
      </div>

      {/* Local / Global selector */}
      {leaderboardEnabled && (
        <div className="hs-tab-bar hs-tab-bar-secondary">
          <button
            className={`hs-tab hs-tab-sm${leaderTab === 'local' ? ' hs-tab-active' : ''}`}
            onClick={() => { setLeaderTab('local'); setExpandedRow(null); }}
          >
            Local
          </button>
          <button
            className={`hs-tab hs-tab-sm${leaderTab === 'global' ? ' hs-tab-active' : ''}`}
            onClick={() => setLeaderTab('global')}
          >
            Global
          </button>
        </div>
      )}

      <div className="stats-container">
        {leaderTab === 'global' && leaderboardEnabled ? (
          <>
            {globalLoading && <p className="no-fish-text">Loading…</p>}
            {globalError   && <p className="no-fish-text hs-error">{globalError}</p>}
            {!globalLoading && !globalError && globalScores.length === 0 && (
              <p className="no-fish-text">No scores yet. Be the first!</p>
            )}
            {!globalLoading && !globalError && globalScores.length > 0 && (
              <ol className="hs-global-list">
                {globalScores.map((entry, i) =>
                  renderRow(i + 1, entry.playerName, entry.score, entry.records ?? {}, i, entry.pointsScore)
                )}
              </ol>
            )}
          </>
        ) : (
          <ol className="hs-global-list">
            {renderLocal()}
          </ol>
        )}
      </div>
    </div>
  );
}
