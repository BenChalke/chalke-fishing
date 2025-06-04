// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import FishDisplay from './components/FishDisplay';
import Controls    from './components/Controls';
import WelcomePopup from './components/WelcomePopup';
import StatsPopup   from './components/StatsPopup';

const FISH_COUNT = 10;
const FISH_SIZE  = 120;
const REPULSE_DISTANCE = 100;

// Speed bounds
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

// Common colours (used when no rare roll succeeds)
const COLOURS  = ['orange', 'blue', 'green', 'purple', 'yellow'];
const PATTERNS = ['solid', 'striped', 'spotted'];

// Rare colours (0.1% each)
const RARE_COLOURS  = ['red', 'pink', 'silver'];
// Super‐rare colours (0.05% each)
const SUPER_COLOURS = ['crimson', 'cyan'];

/**
 * Generate an array of FISH_COUNT fish with id, x, y, angle, colour, pattern.
 */
function createInitialFish() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const arr = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const x = Math.random() * (w - FISH_SIZE);
    const y = Math.random() * (h - FISH_SIZE / 2);
    const angle = Math.random() * 2 * Math.PI;
    const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    arr.push({ id: i, x, y, angle, colour, pattern });
  }
  return arr;
}

export default function App() {
  // ─────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────

  // 1) Array of all live fish
  const [fishArray, setFishArray] = useState([]);

  // 2) Shared speed
  const [speed, setSpeed] = useState(1.5);

  // 3) Cursor + “jerk” (for hook animation)
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);

  // 4) Active catch animations (hook+dead fish flying up)
  const [catchAnimations, setCatchAnimations] = useState([]);

  // 5) Caught‐fish records (lazy‐loaded from localStorage)
  const [caughtRecords, setCaughtRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('caughtRecords');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6) Show/hide “Fish Caught” popup
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);

  // 7) Detect mobile (touch) environment
  const [isMobile, setIsMobile] = useState(false);

  // 8) Show welcome popup only on first visit
  const [showWelcome, setShowWelcome] = useState(false);

  const [showControls, setShowControls] = useState(true);

  // Refs: for mouse repulsion and next unique ID
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_COUNT);

  // ─────────────────────────────────────────────────────────────
  // ON MOUNT: initialize fish, environment, and welcome flag
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1) Populate initial fish
    setFishArray(createInitialFish());

    // 2) Detect if this device has “ontouchstart”
    setIsMobile('ontouchstart' in window);

    // 3) Check “seenWelcome” in localStorage
    const seen = localStorage.getItem('seenWelcome');
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // SAVE caughtRecords TO localStorage WHENEVER CAUGHT RECORDS CHANGE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('caughtRecords', JSON.stringify(caughtRecords));
  }, [caughtRecords]);

  // ─────────────────────────────────────────────────────────────
  // FISH MOVEMENT LOOP
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        return prevFish.map((fish) => {
          let { id, x, y, angle, colour, pattern } = fish;

          // Default movement vector
          let dx = Math.cos(angle) * speed;
          let dy = Math.sin(angle) * speed;

          // Only apply repulsion when not on mobile
          if (!isMobile) {
            const centerX = x + FISH_SIZE / 2;
            const centerY = y + FISH_SIZE / 4;
            const diffX = centerX - cursorRef.current.x;
            const diffY = centerY - cursorRef.current.y;
            const dist  = Math.hypot(diffX, diffY);

            if (dist < REPULSE_DISTANCE) {
              const repelAngle = Math.atan2(diffY, diffX);
              dx = Math.cos(repelAngle) * speed;
              dy = Math.sin(repelAngle) * speed;
              angle = repelAngle;
            }
          }

          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;

          // Bounce off vertical walls
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - angle;
            dx = Math.cos(newAngle) * speed;
            newX = x + dx;
          }

          // Bounce off horizontal walls
          if (newY <= 0 || newY + FISH_SIZE / 2 >= h) {
            newAngle = -angle;
            dy = Math.sin(newAngle) * speed;
            newY = y + dy;
          }

          return { id, x: newX, y: newY, angle: newAngle, colour, pattern };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, [speed, isMobile]);

  // ─────────────────────────────────────────────────────────────
  // TRACK GLOBAL MOUSE MOVE (desktop only)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // HOOK “JERK” ON POINTER DOWN (mousedown OR touchstart)
  // ─────────────────────────────────────────────────────────────
  const handlePointerDown = (e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    const pos = { x: clientX, y: clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // ─────────────────────────────────────────────────────────────
  // WHEN A FISH IS CLICKED: record, remove, and start catch animation
  // ─────────────────────────────────────────────────────────────
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const fishObj = fishArray.find((f) => f.id === fishId);
    const { colour, pattern } = fishObj ?? {};
    const caughtType = `${colour} ${pattern}`;
    const { x: curX, y: curY } = cursorRef.current;

    // Remove from live array
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));

    // Add to caughtRecords
    if (caughtType) {
      setCaughtRecords((prev) => [...prev, caughtType]);
    }

    // Start catch animation
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);
  };

  // ─────────────────────────────────────────────────────────────
  // WHEN CATCH ANIMATION ENDS: remove from catchAnimations
  // ─────────────────────────────────────────────────────────────
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // ─────────────────────────────────────────────────────────────
  // RESET FISH (but keep stats intact)
  // ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
    // DO NOT clear caughtRecords here
  };

  // ─────────────────────────────────────────────────────────────
  // ADD ONE NEW RANDOM FISH (with rare/super‐rare logic)
  // ─────────────────────────────────────────────────────────────
  const handleAddFish = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.random() * (w - FISH_SIZE);
    const y = Math.random() * (h - FISH_SIZE / 2);

    let colour, pattern;
    const roll = Math.random();
    if (roll < 0.0005) {
      // 0.05% → super‐rare crimson
      colour = 'crimson';
      pattern = 'solid';
    } else if (roll < 0.001) {
      // 0.05% → super‐rare cyan
      colour = 'cyan';
      pattern = 'solid';
    } else if (roll < 0.002) {
      // 0.1% → rare red
      colour = 'red';
      pattern = 'solid';
    } else if (roll < 0.003) {
      // 0.1% → rare pink
      colour = 'pink';
      pattern = 'solid';
    } else if (roll < 0.004) {
      // 0.1% → rare silver
      colour = 'silver';
      pattern = 'solid';
    } else {
      // common
      colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
      pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    }

    const newFish = {
      id: nextId.current,
      x,
      y,
      angle,
      colour,
      pattern,
    };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  // ─────────────────────────────────────────────────────────────
  // ADJUST SPEED HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };

  // ─────────────────────────────────────────────────────────────
  // TOGGLE “Fish Caught” STATS POPUP
  // ─────────────────────────────────────────────────────────────
  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

  // ─────────────────────────────────────────────────────────────
  // CLOSE WELCOME POPUP & MARK AS SEEN
  // ─────────────────────────────────────────────────────────────
  const closeWelcome = () => {
    localStorage.setItem('seenWelcome', 'true');
    setShowWelcome(false);
  };

  // ─────────────────────────────────────────────────────────────
  // BUILD A TALLY OF CAUGHT FISH FOR THE STATS POPUP
  // ─────────────────────────────────────────────────────────────
  const tally = caughtRecords.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`container ${!showWelcome ? 'no-cursor' : ''}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {/* 1) Welcome Popup if needed */}
      {showWelcome && <WelcomePopup onClose={closeWelcome} />}

      {/* 2) FishDisplay handles bubbles, all fish, the hook, and catch-animations */}
      <FishDisplay
        fishArray={fishArray}
        isMobile={isMobile}
        cursorPos={cursorPos}
        isJerking={isJerking}
        isCatching={isCatching}
        catchAnimations={catchAnimations}
        onFishClick={handleFishClick}
        onCatchAnimationEnd={handleCatchAnimationEnd}
        speed={speed}
      />

      {/* 3) Controls (speed label, fish-count label, and all buttons) */}
      <Controls
        speed={speed}
        fishCount={caughtRecords.length}
        onSpeedDown={handleSpeedDown}
        onSpeedUp={handleSpeedUp}
        onAddFish={handleAddFish}
        onReset={handleReset}
        onToggleStats={toggleCaughtPopup}
        showControls={showControls}
        onToggleVisibility={() => setShowControls((prev) => !prev)}
     />

      {/* 4) Stats Popup (Fish Caught), if opened */}
      {showCaughtPopup && (
        <StatsPopup
          caughtRecords={caughtRecords}
          tally={tally}
          isMobile={isMobile}
          onClose={toggleCaughtPopup}
        />
      )}
    </div>
  );
}
