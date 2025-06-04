// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import Fish           from './components/Fish';
import Hook           from './components/Hook';
import Bubbles        from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation';
import Controls       from './components/Controls';
import WelcomePopup   from './components/WelcomePopup';
import StatsPopup     from './components/StatsPopup';

// Import constants
import {
  COLOURS,
  PATTERNS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from './constants/fishConstants';

const FISH_COUNT       = 10;
const FISH_SIZE        = 120;
const REPULSE_DISTANCE = 100;

// Speed bounds
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

/**
 * createInitialFish()
 *
 * Spawns FISH_COUNT fish at random positions and angles,
 * using each rare/super-rare cutoff × 2 (100% less rare).
 */
function createInitialFish() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const arr = [];

  for (let i = 0; i < FISH_COUNT; i++) {
    const x     = Math.random() * (w - FISH_SIZE);
    const y     = Math.random() * (h - FISH_SIZE / 2);
    const angle = Math.random() * 2 * Math.PI;

    let colour, pattern;
    const roll = Math.random();

    // Super‐rare (each original cut × 2):
    if (roll < 0.00040) {
      colour = 'aurora';   pattern = 'solid';
    } else if (roll < 0.00080) {
      colour = 'midnight'; pattern = 'solid';
    } else if (roll < 0.00120) {
      colour = 'obsidian'; pattern = 'solid';
    } else if (roll < 0.00160) {
      colour = 'galactic'; pattern = 'solid';
    } else if (roll < 0.00200) {
      colour = 'phantom';  pattern = 'solid';
    } else if (roll < 0.00240) {
      colour = 'rainbow';  pattern = 'striped';
    } else if (roll < 0.00280) {
      colour = 'volcano';  pattern = 'spotted';

    // Rare (each original cut × 2):
    } else if (roll < 0.00500) {
      colour = 'emerald';  pattern = 'striped';
    } else if (roll < 0.00900) {
      colour = 'sunset';   pattern = 'spotted';
    } else if (roll < 0.01200) {
      colour = 'neon';     pattern = 'striped';
    } else if (roll < 0.01500) {
      colour = 'golden';   pattern = 'solid';
    } else if (roll < 0.01800) {
      colour = 'aqua';     pattern = 'spotted';
    } else if (roll < 0.02100) {
      colour = 'lavender'; pattern = 'striped';
    } else if (roll < 0.02400) {
      colour = 'coral';    pattern = 'spotted';
    } else {
      // fallback to a common fish
      colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
      pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    }

    arr.push({ id: i, x, y, angle, colour, pattern });
  }

  return arr;
}

export default function App() {
  const [fishArray, setFishArray]           = useState([]);
  const [speed, setSpeed]                   = useState(1.5);
  const [cursorPos, setCursorPos]           = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking]           = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords]   = useState(() => {
    try {
      const saved = localStorage.getItem('caughtRecords');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);
  const [isMobile, setIsMobile]               = useState(false);
  const [showWelcome, setShowWelcome]         = useState(false);
  const [showControls, setShowControls]       = useState(true);

  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_COUNT);

  // On‐mount: initialize fish & check touch capability & welcome popup
  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile('ontouchstart' in window);
    const seen = localStorage.getItem('seenWelcome');
    if (!seen) setShowWelcome(true);
  }, []);

  // Persist caughtRecords to localStorage
  useEffect(() => {
    localStorage.setItem('caughtRecords', JSON.stringify(caughtRecords));
  }, [caughtRecords]);

  // Fish‐movement loop (runs every 30ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        return prevFish.map((fish) => {
          let { id, x, y, angle, colour, pattern } = fish;
          let dx = Math.cos(angle) * speed;
          let dy = Math.sin(angle) * speed;

          // On desktop, repel from cursor if too close
          if (!isMobile) {
            const centerX = x + FISH_SIZE / 2;
            const centerY = y + FISH_SIZE / 4;
            const diffX = centerX - cursorRef.current.x;
            const diffY = centerY - cursorRef.current.y;
            const dist  = Math.hypot(diffX, diffY);

            if (dist < REPULSE_DISTANCE) {
              const repelAngle = Math.atan2(diffY, diffX);
              dx    = Math.cos(repelAngle) * speed;
              dy    = Math.sin(repelAngle) * speed;
              angle = repelAngle;
            }
          }

          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;

          // Bounce horizontally
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - angle;
            const bounceDX = Math.cos(newAngle) * speed;
            newX = x + bounceDX;
          }

          // Bounce vertically
          if (newY <= 0 || newY + FISH_SIZE / 2 >= h) {
            newAngle = -angle;
            const bounceDY = Math.sin(newAngle) * speed;
            newY = y + bounceDY;
          }

          return { id, x: newX, y: newY, angle: newAngle, colour, pattern };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, [speed, isMobile]);

  // Track cursor on desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // On pointer down (desktop or touch), jerk the hook
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

  // When a fish is clicked/caught
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const fishObj   = fishArray.find((f) => f.id === fishId);
    const { colour, pattern } = fishObj ?? {};
    const caughtType = `${colour} ${pattern}`;
    const { x: curX, y: curY } = cursorRef.current;

    // Remove from live array
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));

    // Add to caughtRecords
    if (caughtType) {
      setCaughtRecords((prev) => [...prev, caughtType]);
    }

    // Trigger catch‐animation
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);
  };

  // Remove a finished catch‐animation
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // Reset fish (keep stats intact)
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
  };

  // Add one new random fish (same doubled probabilities)
  const handleAddFish = () => {
    const w     = window.innerWidth;
    const h     = window.innerHeight;
    const angle = Math.random() * 2 * Math.PI;
    const x     = Math.random() * (w - FISH_SIZE);
    const y     = Math.random() * (h - FISH_SIZE / 2);

    let colour, pattern;
    const roll = Math.random();

    // Super‐rare (each original cut × 2):
    if (roll < 0.00040) {
      colour = 'aurora';   pattern = 'solid';
    } else if (roll < 0.00080) {
      colour = 'midnight'; pattern = 'solid';
    } else if (roll < 0.00120) {
      colour = 'obsidian'; pattern = 'solid';
    } else if (roll < 0.00160) {
      colour = 'galactic'; pattern = 'solid';
    } else if (roll < 0.00200) {
      colour = 'phantom';  pattern = 'solid';
    } else if (roll < 0.00240) {
      colour = 'rainbow';  pattern = 'striped';
    } else if (roll < 0.00280) {
      colour = 'volcano';  pattern = 'spotted';

    // Rare (each original cut × 2):
    } else if (roll < 0.00500) {
      colour = 'emerald';  pattern = 'striped';
    } else if (roll < 0.00900) {
      colour = 'sunset';   pattern = 'spotted';
    } else if (roll < 0.01200) {
      colour = 'neon';     pattern = 'striped';
    } else if (roll < 0.01500) {
      colour = 'golden';   pattern = 'solid';
    } else if (roll < 0.01800) {
      colour = 'aqua';     pattern = 'spotted';
    } else if (roll < 0.02100) {
      colour = 'lavender'; pattern = 'striped';
    } else if (roll < 0.02400) {
      colour = 'coral';    pattern = 'spotted';
    } else {
      // common fallback
      colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
      pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    }

    const newFish = { id: nextId.current, x, y, angle, colour, pattern };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  // Adjust speed handlers
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };

  // Toggle stats popup
  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

  // Close welcome popup & mark as seen
  const closeWelcome = () => {
    localStorage.setItem('seenWelcome', 'true');
    setShowWelcome(false);
  };

  // Build a tally of caught fish for display
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
      {showWelcome && <WelcomePopup onClose={closeWelcome} />}

      <Bubbles />

      {/* Live fish */}
      {fishArray.map((fish) => {
        const isSuper = SUPER_COLOURS.includes(fish.colour);
        return (
          <Fish
            key={fish.id}
            id={fish.id}
            x={fish.x}
            y={fish.y}
            size={isSuper ? FISH_SIZE * 1.5 : FISH_SIZE}
            colour={fish.colour}
            pattern={fish.pattern}
            angle={fish.angle}
            speed={speed}
            onClick={(e) => handleFishClick(fish.id, e)}
            isMobile={isMobile}
          />
        );
      })}

      {/* Hook as cursor on desktop */}
      {!isCatching && !isMobile && !showWelcome && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* Caught‐fish animations */}
      {catchAnimations.map((anim) => (
        <CatchAnimation
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          fishSize={FISH_SIZE}
          onAnimationEnd={() => handleCatchAnimationEnd(anim.id)}
        >
          <Hook x={anim.startX} y={anim.startY} jerking={false} />
          <Fish
            x={0}
            y={0}
            size={FISH_SIZE}
            colour={anim.colour}
            pattern={anim.pattern}
            angle={0}
            speed={speed}
            isDead={true}
            isMobile={isMobile}
          />
        </CatchAnimation>
      ))}

      {/* Controls */}
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
        isMobile={isMobile}
      />

      {/* Stats popup */}
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
