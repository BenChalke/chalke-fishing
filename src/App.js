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
const ENTRY_MULT       = 3;    // Entry‐phase speed multiplier

// Speed bounds
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

/**
 * Generate a random on‐screen fish:
 *  • justSpawned: false
 *  • speedMult: 1
 */
function createRandomFish(id) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const angle = Math.random() * 2 * Math.PI;
  const x = Math.random() * (w - FISH_SIZE);
  const y = Math.random() * (h - FISH_SIZE / 2);

  let colour, pattern;
  const roll = Math.random();
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
    colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  }

  return {
    id,
    x,
    y,
    angle,
    colour,
    pattern,
    justSpawned: false,
    speedMult: 1,
  };
}

/**
 * Generate an off‐screen fish that swims in quickly:
 *  • justSpawned: true
 *  • speedMult: ENTRY_MULT
 */
function createOffscreenFish(id) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fishHeight = FISH_SIZE * 0.5;

  // Randomly pick one edge: 0 = left, 1 = right, 2 = top, 3 = bottom
  const edge = Math.floor(Math.random() * 4);

  let x, y, angle;
  if (edge === 0) {
    // Left edge: start fully to the left
    x = -FISH_SIZE;
    y = Math.random() * (h - fishHeight);
    // Angle toward the right: between –45° and +45°
    angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  } else if (edge === 1) {
    // Right edge: start fully to the right
    x = w;
    y = Math.random() * (h - fishHeight);
    angle = Math.PI + (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  } else if (edge === 2) {
    // Top edge: start fully above
    x = Math.random() * (w - FISH_SIZE);
    y = -fishHeight;
    angle = (Math.PI / 4) + (Math.random() * (Math.PI / 2));
  } else {
    // Bottom edge: start fully below
    x = Math.random() * (w - FISH_SIZE);
    y = h;
    angle = - (Math.PI / 4) - (Math.random() * (Math.PI / 2));
  }

  let colour, pattern;
  const roll = Math.random();
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
    colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  }

  return {
    id,
    x,
    y,
    angle,
    colour,
    pattern,
    justSpawned: true,
    speedMult: ENTRY_MULT,
  };
}

/**
 * Generate the initial set of fish, all on‐screen.
 */
function createInitialFish() {
  const arr = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    arr.push(createRandomFish(i));
  }
  return arr;
}

export default function App() {
  const [fishArray, setFishArray]            = useState([]);
  const [speed, setSpeed]                    = useState(1.5);
  const [cursorPos, setCursorPos]            = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking]            = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords]    = useState(() => {
    try {
      const saved = localStorage.getItem('caughtRecords');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [score, setScore]                    = useState(() => {
    try {
      const saved = localStorage.getItem('score');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [scoreNotifs, setScoreNotifs]        = useState([]);
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);
  const [isMobile, setIsMobile]               = useState(false);
  const [showWelcome, setShowWelcome]         = useState(false);
  const [showControls, setShowControls]       = useState(true);

  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_COUNT);
  const nextNotif = useRef(0);

  // On mount: initialize fish, detect touch, check welcome popup
  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile('ontouchstart' in window);
    const seen = localStorage.getItem('seenWelcome');
    if (!seen) setShowWelcome(true);
  }, []);

  // Persist caughtRecords & score to localStorage
  useEffect(() => {
    localStorage.setItem('caughtRecords', JSON.stringify(caughtRecords));
  }, [caughtRecords]);

  useEffect(() => {
    localStorage.setItem('score', String(score));
  }, [score]);

  // Fish‐movement loop (ticks every 30ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const fishHeight = FISH_SIZE * 0.5;
        const centerX = w / 2;
        const centerY = h / 2;

        return prevFish.map((fish) => {
          let {
            id,
            x,
            y,
            angle,
            colour,
            pattern,
            justSpawned,
            speedMult,
          } = fish;

          // Effective speed = global speed × fish.speedMult (ENTRY_MULT for entry fish)
          const effSpeed = speed * speedMult;

          // If fish is still in “entry” mode:
          if (justSpawned) {
            // 1) Calculate fish center
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;

            // 2) Compute angle that points directly to screen center
            const angleToCenter = Math.atan2(centerY - fishCY, centerX - fishCX);

            // Move along that vector at entry speed
            const dx = Math.cos(angleToCenter) * effSpeed;
            const dy = Math.sin(angleToCenter) * effSpeed;
            const newX = x + dx;
            const newY = y + dy;

            // 3) Check if fully inside bounds now
            const fullyInside =
              newX >= 0 &&
              newX + FISH_SIZE <= w &&
              newY >= 0 &&
              newY + fishHeight <= h;

            // If now fully inside, end entry phase
            if (fullyInside) {
              return {
                id,
                x: newX,
                y: newY,
                angle: angleToCenter,      // keep whichever angle is current
                colour,
                pattern,
                justSpawned: false,
                speedMult: 1,              // revert to normal speed
              };
            }

            // Otherwise remain in entry phase (still justSpawned: true)
            return {
              id,
              x: newX,
              y: newY,
              angle: angleToCenter,      // always steer to center during entry
              colour,
              pattern,
              justSpawned: true,
              speedMult: ENTRY_MULT,
            };
          }

          // ——— Normal behavior (once justSpawned is false) ———

          // 1) Compute repulsion if on desktop
          let dx = Math.cos(angle) * effSpeed;
          let dy = Math.sin(angle) * effSpeed;

          if (!isMobile) {
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;
            const diffX = fishCX - cursorRef.current.x;
            const diffY = fishCY - cursorRef.current.y;
            const dist  = Math.hypot(diffX, diffY);

            if (dist < REPULSE_DISTANCE) {
              const repelAngle = Math.atan2(diffY, diffX);
              dx    = Math.cos(repelAngle) * effSpeed;
              dy    = Math.sin(repelAngle) * effSpeed;
              angle = repelAngle;
            }
          }

          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;

          // 2) Bounce‐outside correction:
          // If fish ends up fully off any edge, flip 180° immediately
          // so it can’t remain stuck outside.
          if (
            newX + FISH_SIZE < 0 ||    // fully left
            newX > w ||                // fully right
            newY + fishHeight < 0 ||   // fully above
            newY > h                    // fully below
          ) {
            // Flip direction 180° and recalc single step
            newAngle = angle + Math.PI;
            const bx = Math.cos(newAngle) * speed;
            const by = Math.sin(newAngle) * speed;
            newX = x + bx;
            newY = y + by;
          }

          // 3) Bounce against walls (only if inside or partially inside):
          // Bounce horizontally
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - newAngle;
            const bounceDX = Math.cos(newAngle) * speed;
            newX = x + bounceDX;
          }
          // Bounce vertically
          if (newY <= 0 || newY + fishHeight >= h) {
            newAngle = -newAngle;
            const bounceDY = Math.sin(newAngle) * speed;
            newY = y + bounceDY;
          }

          return {
            id,
            x: newX,
            y: newY,
            angle: newAngle,
            colour,
            pattern,
            justSpawned: false,
            speedMult: 1,
          };
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

  /**
   * On fish click:
   * 1) Award points based on rarity
   * 2) Remove that fish & spawn an off‐screen replacement (justSpawned: true, speedMult: ENTRY_MULT)
   * 3) Add to caughtRecords & trigger catch‐animation
   * 4) Show floating “+points” notification
   */
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const fishObj = fishArray.find((f) => f.id === fishId);
    if (!fishObj) return;
    const { colour, pattern } = fishObj;

    // 1) Compute points
    let points = 10; // common base
    if (SUPER_COLOURS.includes(colour)) {
      points = 200;
    } else if (RARE_COLOURS.includes(colour)) {
      points = 50;
    }
    setScore((prev) => prev + points);

    // 2) Remove fish & spawn off‐screen replacement
    setFishArray((prev) => {
      const filtered = prev.filter((f) => f.id !== fishId);
      const newFish  = createOffscreenFish(nextId.current);
      nextId.current += 1;
      return [...filtered, newFish];
    });

    // 3) Add to caughtRecords & trigger catch‐animation
    const caughtType = `${colour} ${pattern}`;
    setCaughtRecords((prev) => [...prev, caughtType]);

    const { x: curX, y: curY } = cursorRef.current;
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);

    // 4) Create floating “+points” notification
    const notifId = nextNotif.current++;
    setScoreNotifs((prev) => [
      ...prev,
      { id: notifId, x: curX, y: curY, points },
    ]);

    // Remove notification after 1 second
    setTimeout(() => {
      setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId));
    }, 1000);
  };

  // Remove a finished catch‐animation
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // Reset fish (preserve score & stats)
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
  };

  // Adjust speed
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

  // Close welcome popup
  const closeWelcome = () => {
    localStorage.setItem('seenWelcome', 'true');
    setShowWelcome(false);
  };

  // Build tally for StatsPopup
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

      {/* Floating score notifications */}
      {scoreNotifs.map((notif) => (
        <span
          key={notif.id}
          className="score-notif"
          style={{
            left: `${notif.x}px`,
            top:  `${notif.y}px`,
          }}
        >
          +{notif.points}
        </span>
      ))}

      {/* Display current score in the top-left */}
      <div className="score-display">
        Score: {score}
      </div>

      {/* Live fish */}
      {fishArray.map((fish) => {
        const isSuper = SUPER_COLOURS.includes(fish.colour);
        // Pass fish.speedMult × speed to Fish so tail animation matches
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
            speed={speed * fish.speedMult}
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
            id={anim.id + 100000}   // distinct ID for the caught/flying‐out fish
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
