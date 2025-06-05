// src/components/FreePlayGame.js
import React, { useState, useEffect, useRef } from 'react';
import FishDisplay from './FishDisplay';    // the “view” portion
import Controls    from './Controls';
import Hook        from './Hook';
import Bubbles     from './Bubbles';
import CatchAnimation from './CatchAnimation';
import WelcomePopup   from './WelcomePopup';
import StatsPopup     from './StatsPopup';
import InfoPopup      from './InfoPopup';

import { 
  COLOURS, PATTERNS, RARE_COLOURS, SUPER_COLOURS 
} from '../constants/fishConstants';
import {
  createInitialFish,
  createOffscreenFish,
  FISH_SIZE,
  ENTRY_MULT,
} from '../utils/fishUtils';

const REPULSE_DISTANCE = 100;
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

/**
 * FreePlayGame: the original unlimited “Fishing” mode.
 * Props:
 *  - onBackToHome: callback when user clicks “Back” (top-left).
 */
export default function FreePlayGame({ onBackToHome }) {
  // ——— STATE ———
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
  const [showInfoPopup, setShowInfoPopup]     = useState(false);
  const [showControls, setShowControls]       = useState(false);
  const [isMobile, setIsMobile]               = useState(false);
  const [showWelcome, setShowWelcome]         = useState(false);

  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_SIZE);  // initial ID offset
  const nextNotif = useRef(0);

  // ——— ON MOUNT ———
  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile('ontouchstart' in window);

    // show welcome if not seen
    const seen = localStorage.getItem('seenWelcome');
    if (!seen) setShowWelcome(true);
  }, []);

  // Persist caughtRecords & score
  useEffect(() => {
    localStorage.setItem('caughtRecords', JSON.stringify(caughtRecords));
  }, [caughtRecords]);
  useEffect(() => {
    localStorage.setItem('score', String(score));
  }, [score]);

  // ——— FISH MOVEMENT LOOP ———
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
            id, x, y, angle, colour, pattern,
            justSpawned, speedMult,
          } = fish;

          const effSpeed = speed * speedMult;

          // ENTRY PHASE: steer to center until fully inside
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

          // NORMAL BEHAVIOR:
          let dx = Math.cos(angle) * effSpeed;
          let dy = Math.sin(angle) * effSpeed;

          // Repulsion on desktop if cursor is close
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

          // If fish goes fully off‐screen, flip direction 180°
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

          // Bounce off vertical walls
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - newAngle;
            const bounceDX = Math.cos(newAngle) * speed;
            newX = x + bounceDX;
          }
          // Bounce off horizontal walls
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

  // ——— CURSOR TRACK (DESKTOP) ———
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ——— HOOK JERK ON POINTER DOWN ———
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
   * 1) Award points (common=10, rare=50, super=200)
   * 2) Remove that fish & spawn off‐screen replacement
   * 3) Add to caughtRecords & animate hook+fish
   * 4) Show floating “+points” notification
   */
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const fishObj = fishArray.find((f) => f.id === fishId);
    if (!fishObj) return;
    const { colour, pattern } = fishObj;

    // 1) Compute points
    let points = 10;
    if (SUPER_COLOURS.includes(colour)) {
      points = 200;
    } else if (RARE_COLOURS.includes(colour)) {
      points = 50;
    }
    setScore((prev) => prev + points);

    // 2) Replace fish with offscreen spawn
    setFishArray((prev) => {
      const filtered = prev.filter((f) => f.id !== fishId);
      const newFish  = createOffscreenFish(nextId.current++);
      return [...filtered, newFish];
    });

    // 3) Add to caughtRecords & trigger catch animation
    const caughtType = `${colour} ${pattern}`;
    setCaughtRecords((prev) => [...prev, caughtType]);
    const { x: curX, y: curY } = cursorRef.current;
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);

    // 4) Floating “+points” notif
    const notifId = nextNotif.current++;
    setScoreNotifs((prev) => [
      ...prev,
      { id: notifId, x: curX, y: curY, points },
    ]);
    setTimeout(() => {
      setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId));
    }, 1000);
  };

  // Remove finished catch animation:
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // ——— CONTROLS CALLBACKS ———
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_SIZE;
    setSpeed(1.5);
  };
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };
  const toggleCaughtPopup = () => setShowCaughtPopup((prev) => !prev);

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
      {/* BACK to HOME */}
      <button
        className="back-home-btn"
        onClick={onBackToHome}
      >
        ← Home
      </button>

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

      {/* Speed & Fish‐Caught (top-right) */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>
      <div className="fish-count-label">Fish Caught: {caughtRecords.length}</div>

      {/* All live fish (FishDisplay wraps Bubbles + Fish + Hook + CatchAnimation) */}
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

      {/* Hook as cursor (desktop), even during catch animations */}
      {!isMobile && !showWelcome && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* Settings Cog & Info Btn & Controls (top-left) */}
      <div className="top-left-ui">
        <button
          className="settings-btn"
          onClick={() => setShowControls((prev) => !prev)}
          aria-label={showControls ? 'Hide controls' : 'Show controls'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm7.65 3.5a5.98 5.98 0 0 0-.18-1l2.03-1.57a.5.5 0 0 0 .11-.63l-1.92-3.32a.5.5 0 0 0-.61-.23l-2.39.96a6.05 6.05 0 0 0-1.73-1l-.36-2.54A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.5.44l-.36 2.54a6.05 6.05 0 0 0-1.73 1l-2.39-.96a.5.5 0 0 0-.61.23L3.4 9.37a.5.5 0 0 0 .11.63l2.03 1.57c-.04.33-.07.66-.07 1s.03.67.07 1l-2.03 1.57a.5.5 0 0 0-.11.63l1.92 3.32a.5.5 0 0 0 .61.23l2.39-.96c.53.42 1.12.75 1.73 1l.36 2.54a.5.5 0 0 0 .5.44h3a.5.5 0 0 0 .5-.44l.36-2.54c.61-.25 1.2-.58 1.73-1l2.39.96a.5.5 0 0 0 .61-.23l1.92-3.32a.5.5 0 0 0-.11-.63l-2.03-1.57c.15-.33.26-.67.33-1Zm-7.65 4.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
          </svg>
        </button>

        <button
          className="info-btn"
          onClick={() => setShowInfoPopup(true)}
          aria-label="Show fish info"
        >
          ?
        </button>

        {showControls && (
          <Controls
            onSpeedDown={handleSpeedDown}
            onSpeedUp={handleSpeedUp}
            onAddFish={() => { /* “Add Fish” disabled for now */ }}
            onReset={handleReset}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Score (top-center) */}
      <div className="top-center-ui">
        <div className="score-display">Score: {score}</div>
      </div>

      {/* “See Fish Caught” (bottom-center) */}
      <div className="bottom-center-ui">
        <button
          className="caught-btn"
          onClick={toggleCaughtPopup}
        >
          See Fish Caught
        </button>
      </div>

      {showCaughtPopup && (
        <StatsPopup
          caughtRecords={caughtRecords}
          tally={tally}
          isMobile={isMobile}
          onClose={toggleCaughtPopup}
        />
      )}

      {showInfoPopup && (
        <InfoPopup
          isMobile={isMobile}
          onClose={() => setShowInfoPopup(false)}
        />
      )}
    </div>
  );
}
