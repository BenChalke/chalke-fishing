// src/components/ModeInstructionsContent.js
import React from 'react';

export default function ModeInstructionsContent({ mode }) {
  if (mode === 'timeTrial') {
    return (
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
    );
  }

  if (mode === 'survival') {
    return (
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
    );
  }

  if (mode === 'targetScore') {
    return (
      <div className="instructions-section">
        <div className="instr-row">
          <span className="instr-icon">🎯</span>
          <p>Each level has a <strong>target score</strong> to reach before the timer runs out. Hit it to advance!</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">📈</span>
          <p>Each new level raises the target, speeds up the fish, and slightly reduces your time limit.</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">⏱</span>
          <p>You start with <strong>35 seconds</strong> per level. This decreases by 2s each level (minimum 15s).</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">+10s</span>
          <p><strong>Time Bonus</strong> power-up adds 10 seconds to your current level timer.</p>
        </div>
        <hr className="instr-divider" />
        <p className="instr-subheading">Combo Chain</p>
        <div className="instr-row">
          <span className="instr-icon">🔥</span>
          <p>Build a combo for multiplied points — crucial for hitting level targets fast.</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">✗</span>
          <p>Clicking <strong>empty water</strong> resets your combo. Misses during Frenzy don't count against you.</p>
        </div>
      </div>
    );
  }

  if (mode === 'quota') {
    return (
      <div className="instructions-section">
        <div className="instr-row">
          <span className="instr-icon">📋</span>
          <p>Each level gives you a <strong>catch quota</strong> — a required number of common, rare, and super rare fish to catch before time runs out.</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">🐟</span>
          <p>The quota is shown in the top bar. Each item turns green with a checkmark when complete. Fill them all to advance!</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">👆</span>
          <p>The clock <strong>doesn't start</strong> until you tap the level card — read what you need, then tap when ready.</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">⏱</span>
          <p>You start with <strong>45 seconds</strong> per level, decreasing by 3s each level (minimum 20s).</p>
        </div>
        <hr className="instr-divider" />
        <p className="instr-subheading">Power-ups</p>
        <div className="instr-row">
          <span className="instr-icon">🟢</span>
          <p><strong>Free</strong> — instantly counts one fish toward each incomplete quota category.</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">🎣</span>
          <p><strong>Lure</strong> — spawns guaranteed quota fish on screen. Still need to catch them!</p>
        </div>
        <div className="instr-row">
          <span className="instr-icon">💥</span>
          <p><strong>Frenzy</strong> — floods the screen with fish including rare types. Best for tough quotas.</p>
        </div>
      </div>
    );
  }

  if (mode === 'free') {
    return (
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
    );
  }

  return null;
}
