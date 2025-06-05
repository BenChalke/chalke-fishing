// src/components/TimeTrialGame.js

import React, { useState, useEffect, useRef } from 'react';
import FishDisplay    from './components/FishDisplay';
import FishField    from './components/FishField';
import Controls       from './components/Controls';
import Hook           from './components/Hook';
import Bubbles        from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation';
import StatsPopup     from './components/StatsPopup';
import Fish           from './components/Fish';

import {
  COLOURS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from './constants/fishConstants';

import {
  createInitialFish,
  createOffscreenFish,
  FISH_SIZE,
  ENTRY_MULT,
} from './utils/fishUtils';

import './TimeTrialGame.css';  // Contains countdown, gameover, time-left, back-home, etc.

const REPULSE_DISTANCE = 100;
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;
const TOTAL_TIME = 60;   // 60 seconds time trial

/**
 * TimeTrialGame: 60 sec timed mode.
 * Props:
 *  - onBackToHome: callback to go back to Home screen.
 */
export default function TimeTrialGame({ onBackToHome }) {
  // ——— PHASE & COUNTS ———
  const [phase, setPhase]                 = useState('countdown'); // 'countdown' → 'running' → 'gameover'
  const [displayNumber, setDisplayNumber] = useState(3);           // for 3 → 2 → 1 → "Go!"
  const [timeLeft, setTimeLeft]           = useState(TOTAL_TIME);

  // ——— FISH & SCORE STATE ———
  const [fishArray, setFishArray]         = useState([]);
  const [speed, setSpeed]                 = useState(1.5);
  const [cursorPos, setCursorPos]         = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking]         = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords] = useState([]);
  const [score, setScore]                 = useState(0);
  const [isMobile, setIsMobile]           = useState(false);

  // ——— NEW: floating “+X” notifications ———
  const [scoreNotifs, setScoreNotifs]     = useState([]);
  const nextNotif = useRef(0);

  // ——— NEW: Controls toggle ———
  const [showControls, setShowControls]   = useState(false);

  // Refs for cursor & unique IDs
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_SIZE);

  // ——— ON MOUNT: initialize fishes & detect mobile ———
  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile('ontouchstart' in window);
  }, []);

  // ——— CURSOR TRACK (desktop) ———
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

  // ——— COUNTDOWN PHASE (3 → 2 → 1 → Go!) ———
  useEffect(() => {
    if (phase !== 'countdown') return;

    // While displayNumber > 0, just count down one per second:
    if (typeof displayNumber === 'number' && displayNumber > 0) {
      const timer = setTimeout(() => {
        setDisplayNumber((n) => n - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Once displayNumber reaches 0, wait one more second, then show “Go!” and switch to running
    if (displayNumber === 0) {
      const timer = setTimeout(() => {
        setDisplayNumber('Go!');
        setPhase('running');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [displayNumber, phase]);

  // ——— RUNNING PHASE: fish motion + TIME COUNTDOWN ———
  useEffect(() => {
    let fishInterval = null;
    let timeInterval = null;

    if (phase === 'running') {
      // Fish movement loop (30ms)
      fishInterval = setInterval(() => {
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

            // ENTRY PHASE: steer to screen center
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

            // If fish fully off‐screen → flip direction
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

      // TIME COUNTDOWN (1000ms)
      timeInterval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timeInterval);
            clearInterval(fishInterval);
            setPhase('gameover');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (fishInterval) clearInterval(fishInterval);
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [phase, speed, isMobile]);

  // ——— HANDLE FISH CLICK (running only, timer continues) ———
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    const fishObj = fishArray.find((f) => f.id === fishId);
    if (!fishObj) return;
    const { colour, pattern } = fishObj;

    // Award points
    let points = 10;
    if (SUPER_COLOURS.includes(colour)) {
      points = 200;
    } else if (RARE_COLOURS.includes(colour)) {
      points = 50;
    }
    setScore((prev) => prev + points);

    // 2) floating “+points” notification
    const notifId = nextNotif.current++;
    const { x: curX, y: curY } = cursorRef.current;
    setScoreNotifs((prev) => [...prev, { id: notifId, x: curX, y: curY, points }]);
    setTimeout(() => {
      setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId));
    }, 1000);

    // Replace fish
    setFishArray((prev) => {
      const filtered = prev.filter((f) => f.id !== fishId);
      const newFish  = createOffscreenFish(nextId.current++);
      return [...filtered, newFish];
    });

    // Record catch + animate
    const caughtType = `${colour} ${pattern}`;
    setCaughtRecords((prev) => [...prev, caughtType]);
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);
  };

  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  // ——— CONTROLS ———
  const handleReset = () => {
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

  // ——— BUILD TALLY for StatsPopup at gameover ———
  const tally = caughtRecords.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  // ——— ONCE PHASE → 'gameover', save high score if better ———
  useEffect(() => {
  if (phase === 'gameover') {
    const savedHigh = JSON.parse(localStorage.getItem('ttHighScore')) || {
      score: 0,
      records: [],
    };
    if (score > savedHigh.score) {
      localStorage.setItem(
        'ttHighScore',
        JSON.stringify({ score, records: caughtRecords })
      );
    }
  }
}, [phase, score, caughtRecords]);

  // ——— RENDER ———

  // COUNTDOWN OVERLAY
  if (phase === 'countdown') {
    return (
      <div className="container">
        <FishField count={0} isInteractive={false} isMobile={isMobile} />
        <div className="trial-countdown-container">
          <div className="trial-countdown-number">
            {displayNumber > 0 ? displayNumber : 'Go!'}
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER OVERLAY
  if (phase === 'gameover') {
    const entries = Object.entries(tally); // [ [ "emerald striped", 3 ], ... ]
    const superRareEntries = entries.filter(([typeStr]) => {
      const colour = typeStr.split(' ')[0];
      return SUPER_COLOURS.includes(colour);
    });
    const rareEntries = entries.filter(([typeStr]) => {
      const colour = typeStr.split(' ')[0];
      return RARE_COLOURS.includes(colour);
    });
    const commonEntries = entries.filter(([typeStr]) => {
      const colour = typeStr.split(' ')[0];
      return (
        !SUPER_COLOURS.includes(colour) &&
        !RARE_COLOURS.includes(colour)
      );
    });

    return (
    <div className="container">
      <FishField count={0} isInteractive={false} isMobile={isMobile} />

      <div className="trial-gameover-overlay">
        <div className="trial-gameover-content">
          {/* ← close-“×” button in top-right */}
          <button
            className="gameover-popup-close-x"
            onClick={onBackToHome}
          >
            ✕
          </button>
          <h2>Game Over</h2>
          <p>Your Score: {score}</p>
          <div className="trial-gameover-content-inner">
            {/* Super Rare */}
            {superRareEntries.length > 0 && (
              <div className="stats-section">
                <h3><strong>Super Rare</strong></h3>
                <ul>
                  {superRareEntries
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([typeStr, count]) => {
                      const [colour, pattern] = typeStr.split(' ');
                      return (
                        <li key={typeStr} className="stats-item">
                          <div className="mini-fish-container">
                            <Fish
                              x={0}
                              y={0}
                              size={40}
                              colour={colour}
                              pattern={pattern}
                              angle={0}
                              speed={1}
                              isDead={false}
                              isMobile={false}
                            />
                          </div>
                          <span className="stat-fish-type">
                            {typeStr}
                          </span>
                          <span className="stat-count">
                            {count}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}

            {/* Rare */}
            {rareEntries.length > 0 && (
              <div className="stats-section">
                <h3><strong>Rare</strong></h3>
                <ul>
                  {rareEntries
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([typeStr, count]) => {
                      const [colour, pattern] = typeStr.split(' ');
                      return (
                        <li key={typeStr} className="stats-item">
                          <div className="mini-fish-container">
                            <Fish
                              x={0}
                              y={0}
                              size={40}
                              colour={colour}
                              pattern={pattern}
                              angle={0}
                              speed={1}
                              isDead={false}
                              isMobile={false}
                            />
                          </div>
                          <span className="stat-fish-type">
                            {typeStr}
                          </span>
                          <span className="stat-count">
                            {count}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}

            {/* Common */}
            {commonEntries.length > 0 && (
              <div className="stats-section">
                <h3>Common</h3>
                <ul>
                  {commonEntries
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([typeStr, count]) => {
                      const [colour, pattern] = typeStr.split(' ');
                      return (
                        <li key={typeStr} className="stats-item">
                          <div className="mini-fish-container">
                            <Fish
                              x={0}
                              y={0}
                              size={40}
                              colour={colour}
                              pattern={pattern}
                              angle={0}
                              speed={1}
                              isDead={false}
                              isMobile={false}
                            />
                          </div>
                          <span className="stat-fish-type">
                            {typeStr}
                          </span>
                          <span className="stat-count">
                            {count}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}

            {caughtRecords.length === 0 && (
              <p className="trial-no-fish">
                You didn’t catch any fish.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  }

  // RUNNING STATE UI
  return (
    <div
      className="container"
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {/* Back to Home */}
      <button
        className="back-home-btn"
        onClick={onBackToHome}
      >
        Quit
      </button>

      {/* — Floating “+X” notifications — */}
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

      <Bubbles />

      {/* Catch animations */}
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

      {/* Time Left (top-center) */}
      <div className="time-left-display">
        Time: {timeLeft}s
      </div>

      {/* Score (top-center) */}
      <div className="top-center-ui">
        <div className="score-display">Score: {score}</div>
      </div>

      {/* Live fish */}
      <FishDisplay
        fishArray={fishArray}
        isMobile={isMobile}
        cursorPos={cursorPos}
        isJerking={isJerking}
        isCatching={catchAnimations.length > 0}
        catchAnimations={catchAnimations}
        onFishClick={handleFishClick}
        onCatchAnimationEnd={handleCatchAnimationEnd}
        speed={speed}
      />

      {/* Hook as cursor (desktop) */}
      {!isMobile && <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />}
    </div>
  );
}
