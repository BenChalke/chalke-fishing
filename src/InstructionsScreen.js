// src/InstructionsScreen.js
import React, { useState } from 'react';
import FishField from './components/FishField';
import ModeInstructionsContent from './components/ModeInstructionsContent';
import './InstructionsScreen.css';

const MODES = [
  { id: 'basics',      label: 'Basics' },
  { id: 'timeTrial',   label: 'Time Trial' },
  { id: 'survival',    label: 'Survival' },
  { id: 'targetScore', label: 'Target Score' },
  { id: 'quota',       label: 'Quota' },
  { id: 'free',        label: 'Free Fishing' },
];

export default function InstructionsScreen({ onBackToHome }) {
  const [tab, setTab] = useState('basics');

  return (
    <div className="container">
      <FishField count={8} isInteractive={false} isMobile={false} />
      <div className="instructions-overlay">
        <h2 className="instructions-title">How to Play</h2>

        <div className="instructions-tabs">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`instructions-tab ${tab === m.id ? 'instructions-tab-active' : ''}`}
              onClick={() => setTab(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="instructions-body">
          {tab !== 'basics' && <ModeInstructionsContent mode={tab} />}
          {tab === 'basics' && (
            <div className="instructions-section">
              <div className="instr-row">
                <span className="instr-icon">🎣</span>
                <p>Move your cursor (or tap on mobile) to control the hook. Click or tap a fish to catch it.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">🐟</span>
                <p><strong>Common fish</strong> — 10 pts each</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">✨</span>
                <p><strong>Rare fish</strong> (shimmering) — 50 pts each</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">🌟</span>
                <p><strong>Super Rare fish</strong> (glowing effects) — 200 pts each</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">💨</span>
                <p><strong>Speed fish</strong> (glowing outline) — worth 3× points but swim fast</p>
              </div>
              <hr className="instr-divider" />
              <p className="instr-subheading">Power-ups</p>
              <div className="instr-row">
                <span className="instr-icon">💥</span>
                <p><strong>Frenzy</strong> — floods the screen with fish for 10s</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">⚡</span>
                <p><strong>x2 Multiplier</strong> — doubles all points for 8s (not in Quota mode)</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">❄</span>
                <p><strong>Slow-mo</strong> — slows all fish for 6s</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">+s</span>
                <p><strong>Time Bonus</strong> — adds extra seconds to your timer (15s in Time Trial, 10s in Target Score, 8s in Quota)</p>
              </div>
              <hr className="instr-divider" />
              <p className="instr-subheading">Quota-only Power-ups</p>
              <div className="instr-row">
                <span className="instr-icon">🟢</span>
                <p><strong>Free</strong> — instantly catches one fish from each incomplete quota category</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">🎣</span>
                <p><strong>Lure</strong> — spawns guaranteed quota fish on screen for you to catch</p>
              </div>
            </div>
          )}

        </div>

        <button className="instructions-back-btn" onClick={onBackToHome}>Back to Home</button>
      </div>
    </div>
  );
}
