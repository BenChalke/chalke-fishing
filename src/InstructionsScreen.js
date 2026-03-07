// src/InstructionsScreen.js
import React, { useState } from 'react';
import FishField from './components/FishField';
import './InstructionsScreen.css';

const MODES = [
  { id: 'basics',    label: 'Basics' },
  { id: 'timeTrial', label: 'Time Trial' },
  { id: 'survival',  label: 'Survival' },
  { id: 'free',      label: 'Free Fishing' },
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
                <span className="instr-icon">⚡</span>
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
                <p><strong>x2 Multiplier</strong> — doubles all points for 8s</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">❄</span>
                <p><strong>Slow-mo</strong> — slows all fish for 6s</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">+15s</span>
                <p><strong>Time Bonus</strong> — adds 15 seconds (Time Trial only)</p>
              </div>
            </div>
          )}

          {tab === 'timeTrial' && (
            <div className="instructions-section">
              <div className="instr-row">
                <span className="instr-icon">⏱</span>
                <p>You have <strong>60 seconds</strong> to catch as many fish as possible and score as high as you can.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">☠</span>
                <p>During <strong>Frenzy</strong>, skull fish appear — clicking one ends the frenzy early and scatters all fish for 3 seconds.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">🏆</span>
                <p>Your best score is saved locally and to the global leaderboard if you submit your name after the game.</p>
              </div>
              <hr className="instr-divider" />
              <p className="instr-subheading">Combo Chain</p>
              <div className="instr-row">
                <span className="instr-icon">🔥</span>
                <p>Catch fish consecutively to build a <strong>combo multiplier</strong> — x2 at 3 catches, x3 at 5, x4 at 8, x5 at 12.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">✗</span>
                <p>Clicking <strong>empty water</strong> resets your combo — but misses during Frenzy don't count against you.</p>
              </div>
            </div>
          )}

          {tab === 'survival' && (
            <div className="instructions-section">
              <div className="instr-row">
                <span className="instr-icon">☠</span>
                <p><strong>Skull fish</strong> are always swimming around. Click one and it's game over — don't do it!</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">⏳</span>
                <p>You must catch a fish <strong>every 10 seconds</strong> or you die. Watch the bar at the top — keep it full!</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">📈</span>
                <p>The longer you survive, the faster the fish swim and the more skull fish appear. How long can you last?</p>
              </div>
              <hr className="instr-divider" />
              <p className="instr-subheading">Combo Chain</p>
              <div className="instr-row">
                <span className="instr-icon">🔥</span>
                <p>Catch fish consecutively to build a <strong>combo multiplier</strong> — x2 at 3 catches, x3 at 5, x4 at 8, x5 at 12.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">✗</span>
                <p>Clicking <strong>empty water</strong> resets your combo back to zero — aim carefully!</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">💥</span>
                <p>During <strong>Frenzy</strong>, misses don't break your combo — extra skull fish spawn but the risk is worth it.</p>
              </div>
            </div>
          )}

          {tab === 'free' && (
            <div className="instructions-section">
              <div className="instr-row">
                <span className="instr-icon">🎣</span>
                <p>No timer, no pressure. Just relax and catch fish at your own pace.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">🚀</span>
                <p>Use the speed controls in the top-right to adjust how fast the fish swim.</p>
              </div>
              <div className="instr-row">
                <span className="instr-icon">📖</span>
                <p>Great for exploring all the different fish types and rare colours.</p>
              </div>
            </div>
          )}
        </div>

        <button className="instructions-back-btn" onClick={onBackToHome}>Back to Home</button>
      </div>
    </div>
  );
}
