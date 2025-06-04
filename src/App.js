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

import {
  COLOURS,
  PATTERNS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from './constants/fishConstants';

const FISH_COUNT       = 10;
const FISH_SIZE        = 120;
const REPULSE_DISTANCE = 100;
const ENTRY_MULT       = 3;

const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

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

function createOffscreenFish(id) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fishHeight = FISH_SIZE * 0.5;
  const edge = Math.floor(Math.random() * 4);

  let x, y, angle;
  if (edge === 0) {
    x = -FISH_SIZE;
    y = Math.random() * (h - fishHeight);
    angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  } else if (edge === 1) {
    x = w;
    y = Math.random() * (h - fishHeight);
    angle = Math.PI + (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  } else if (edge === 2) {
    x = Math.random() * (w - FISH_SIZE);
    y = -fishHeight;
    angle = (Math.PI / 4) + (Math.random() * (Math.PI / 2));
  } else {
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
  const [showControls, setShowControls]       = useState(false);

  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_COUNT);
  const nextNotif = useRef(0);

  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile('ontouchstart' in window);
    const seen = localStorage.getItem('seenWelcome');
    if (!seen) setShowWelcome(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('caughtRecords', JSON.stringify(caughtRecords));
  }, [caughtRecords]);

  useEffect(() => {
    localStorage.setItem('score', String(score));
  }, [score]);

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

          const effSpeed = speed * speedMult;

          if (justSpawned) {
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;
            const angleToCenter = Math.atan2(centerY - fishCY, centerX - fishCX);
            const dx = Math.cos(angleToCenter) * effSpeed;
            const dy = Math.sin(angleToCenter) * effSpeed;
            const newX = x + dx;
            const newY = y + dy;
            const fullyInside =
              newX >= 0 &&
              newX + FISH_SIZE <= w &&
              newY >= 0 &&
              newY + fishHeight <= h;
            if (fullyInside) {
              return {
                id,
                x: newX,
                y: newY,
                angle: angleToCenter,
                colour,
                pattern,
                justSpawned: false,
                speedMult: 1,
              };
            }
            return {
              id,
              x: newX,
              y: newY,
              angle: angleToCenter,
              colour,
              pattern,
              justSpawned: true,
              speedMult: ENTRY_MULT,
            };
          }

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

          if (
            newX + FISH_SIZE < 0 ||
            newX > w ||
            newY + fishHeight < 0 ||
            newY > h
          ) {
            newAngle = angle + Math.PI;
            const bx = Math.cos(newAngle) * speed;
            const by = Math.sin(newAngle) * speed;
            newX = x + bx;
            newY = y + by;
          }

          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - newAngle;
            const bounceDX = Math.cos(newAngle) * speed;
            newX = x + bounceDX;
          }
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const fishObj = fishArray.find((f) => f.id === fishId);
    if (!fishObj) return;
    const { colour, pattern } = fishObj;

    let points = 10;
    if (SUPER_COLOURS.includes(colour)) {
      points = 200;
    } else if (RARE_COLOURS.includes(colour)) {
      points = 50;
    }
    setScore((prev) => prev + points);

    setFishArray((prev) => {
      const filtered = prev.filter((f) => f.id !== fishId);
      const newFish  = createOffscreenFish(nextId.current);
      nextId.current += 1;
      return [...filtered, newFish];
    });

    const caughtType = `${colour} ${pattern}`;
    setCaughtRecords((prev) => [...prev, caughtType]);

    const { x: curX, y: curY } = cursorRef.current;
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);

    const notifId = nextNotif.current++;
    setScoreNotifs((prev) => [
      ...prev,
      { id: notifId, x: curX, y: curY, points },
    ]);

    setTimeout(() => {
      setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId));
    }, 1000);
  };

  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
  };

  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };

  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

  const closeWelcome = () => {
    localStorage.setItem('seenWelcome', 'true');
    setShowWelcome(false);
  };

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

      {/* ───── Speed & Fish‐Caught (top-right, permanent) ───── */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>
      <div className="fish-count-label">Fish Caught: {caughtRecords.length}</div>
      {/* ─────────────────────────────────────────────────────── */}

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
            speed={speed * fish.speedMult}
            onClick={(e) => handleFishClick(fish.id, e)}
            isMobile={isMobile}
          />
        );
      })}

      {!isCatching && !isMobile && !showWelcome && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

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
            id={anim.id + 100000}
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

      {/* ───── Settings Cog & Controls (top-left) ───── */}
      <div className="top-left-ui">
        <button
          className="settings-btn"
          onClick={() => setShowControls((prev) => !prev)}
          aria-label={showControls ? 'Hide controls' : 'Show controls'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm7.65 3.5a5.98 5.98 0 0 0-.18-1l2.03-1.57a.5.5 0 0 0 .11-.63l-1.92-3.32a.5.5 0 0 0-.61-.23l-2.39.96a6.05 6.05 0 0 0-1.73-1l-.36-2.54A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.5.44l-.36 2.54a6.05 6.05 0 0 0-1.73 1l-2.39-.96a.5.5 0 0 0-.61.23L3.4 9.37a.5.5 0 0 0 .11.63l2.03 1.57c-.04.33-.07.66-.07 1s.03.67.07 1l-2.03 1.57a.5.5 0 0 0-.11.63l1.92 3.32a.5.5 0 0 0 .61.23l2.39-.96c.53.42 1.12.75 1.73 1l.36 2.54a.5.5 0 0 0 .5.44h3a.5.5 0 0 0 .5-.44l.36-2.54c.61-.25 1.2-.58 1.73-1l2.39.96a.5.5 0 0 0 .61-.23l1.92-3.32a.5.5 0 0 0-.11-.63l-2.03-1.57c.15-.33.26-.67.33-1Zm-7.65 4.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
          </svg>
        </button>

        {showControls && (
          <Controls
            onSpeedDown={handleSpeedDown}
            onSpeedUp={handleSpeedUp}
            onAddFish={() => { /* existing add-fish logic */ }}
            onReset={handleReset}
            isMobile={isMobile}
          />
        )}
      </div>
      {/* ──────────────────────────────────────────────── */}

      {/* ───── Score centered (top) ───── */}
      <div className="top-center-ui">
        <div className="score-display">Score: {score}</div>
      </div>
      {/* ──────────────────────────────────────── */}

      {/* ───── Fish Caught Button (bottom-center) ───── */}
      <div className="bottom-center-ui">
        <button
          className="caught-btn"
          onClick={toggleCaughtPopup}
        >
          See Fish Caught
        </button>
      </div>
      {/* ──────────────────────────────────────────────── */}

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
