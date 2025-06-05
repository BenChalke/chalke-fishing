// src/FreePlayGame.jsx
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Fish from "./components/Fish";
import Hook from "./components/Hook";
import Bubbles from "./components/Bubbles";
import CatchAnimation from "./components/CatchAnimation";
import Controls from "./components/Controls";
import WelcomePopup from "./components/WelcomePopup";
import StatsPopup from "./components/StatsPopup";
import InfoPopup from "./components/InfoPopup";

import {
  COLOURS,
  PATTERNS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from "./constants/fishConstants";

import {
  createRandomFish,
  createOffscreenFish,
  createInitialFish,
  FISH_COUNT,
  FISH_SIZE,
  ENTRY_MULT,
} from "./utils/fishUtils";

const REPULSE_DISTANCE = 100;

// Speed bounds
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

/**
 * FreePlayGame is the “infinite fishing” mode.
 * It takes a prop `onBackToHome` so the user can return to the home screen.
 */
export default function FreePlayGame({ onBackToHome }) {
  // ——— STATE ———
  const [fishArray, setFishArray] = useState([]);
  const [speed, setSpeed] = useState(1.5);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("caughtRecords");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [score, setScore] = useState(() => {
    try {
      const saved = localStorage.getItem("score");
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [scoreNotifs, setScoreNotifs] = useState([]);
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for cursor tracking and unique IDs
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId = useRef(FISH_COUNT);
  const nextNotif = useRef(0);

  // ——— EFFECTS ———

  // On mount: populate initial fish, detect touch, and check if we've seen the welcome popup
  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile("ontouchstart" in window);
    const seen = localStorage.getItem("seenWelcome");
    if (!seen) setShowWelcome(true);
  }, []);

  // Persist caughtRecords → localStorage
  useEffect(() => {
    localStorage.setItem("caughtRecords", JSON.stringify(caughtRecords));
  }, [caughtRecords]);

  // Persist score → localStorage
  useEffect(() => {
    localStorage.setItem("score", String(score));
  }, [score]);

  // Fish‐movement loop (every 30ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const fishHeight = FISH_SIZE * 0.5;
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

          // Effective speed = global speed × fish.speedMult
          const effSpeed = speed * speedMult;

          // — Entry behavior (justSpawned) —
          if (justSpawned) {
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;
            // Steer toward center of screen
            const angleToCenter = Math.atan2(h / 2 - fishCY, w / 2 - fishCX);
            const dx = Math.cos(angleToCenter) * effSpeed;
            const dy = Math.sin(angleToCenter) * effSpeed;
            const newX = x + dx;
            const newY = y + dy;
            // Check if fully inside bounds now
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
            // Otherwise remain in entry mode
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

          // — Normal “swim around” behavior —
          let dx = Math.cos(angle) * effSpeed;
          let dy = Math.sin(angle) * effSpeed;
          if (!isMobile) {
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;
            const diffX = fishCX - cursorRef.current.x;
            const diffY = fishCY - cursorRef.current.y;
            const dist = Math.hypot(diffX, diffY);
            // If mouse is too close, fish repels
            if (dist < REPULSE_DISTANCE) {
              const repelAngle = Math.atan2(diffY, diffX);
              dx = Math.cos(repelAngle) * effSpeed;
              dy = Math.sin(repelAngle) * effSpeed;
              angle = repelAngle;
            }
          }

          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;

          // If fully off any edge, flip 180°
          if (
            newX + FISH_SIZE < 0 ||
            newX > w ||
            newY + fishHeight < 0 ||
            newY > h
          ) {
            newAngle = angle + Math.PI;
            const bounceDx = Math.cos(newAngle) * speed;
            const bounceDy = Math.sin(newAngle) * speed;
            newX = x + bounceDx;
            newY = y + bounceDy;
          }

          // Bounce horizontally if hitting left/right walls
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - newAngle;
            const bounceDx = Math.cos(newAngle) * speed;
            newX = x + bounceDx;
          }
          // Bounce vertically if hitting top/bottom walls
          if (newY <= 0 || newY + fishHeight >= h) {
            newAngle = -newAngle;
            const bounceDy = Math.sin(newAngle) * speed;
            newY = y + bounceDy;
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
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // On pointer‐down, “jerk” the hook briefly
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

  // ——— FISH‐CLICK HANDLER ———
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
    // 2) Remove that fish & spawn an off‐screen replacement
    setFishArray((prev) => {
      const filtered = prev.filter((f) => f.id !== fishId);
      const newFish = createOffscreenFish(nextId.current);
      nextId.current += 1;
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
    // 4) Create floating “+points” notification
    const notifId = nextNotif.current++;
    setScoreNotifs((prev) => [...prev, { id: notifId, x: curX, y: curY, points }]);
    setTimeout(() => {
      setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId));
    }, 1000);
  };

  // Remove a finished catch animation
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

  // Toggle “Fish Caught” stats popup
  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

  // Close welcome popup
  const closeWelcome = () => {
    localStorage.setItem("seenWelcome", "true");
    setShowWelcome(false);
  };

  // Build tally for StatsPopup
  const tally = caughtRecords.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`container ${!showWelcome ? "no-cursor" : ""}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {/* — BACK TO HOME BUTTON — */}
      <button className="back-home-btn" onClick={onBackToHome}>
        ← Home
      </button>

      {/* — WELCOME POPUP (only once) — */}
      {showWelcome && <WelcomePopup onClose={closeWelcome} />}

      {/* — BUBBLES IN BACKGROUND — */}
      <Bubbles />

      {/* — FLOATING “+X” NOTIFICATIONS — */}
      {scoreNotifs.map((notif) => (
        <span
          key={notif.id}
          className="score-notif"
          style={{
            left: `${notif.x}px`,
            top: `${notif.y}px`,
          }}
        >
          +{notif.points}
        </span>
      ))}

      {/* — SPEED & FISH‐CAUGHT LABELS (top‐right) — */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>
      <div className="fish-count-label">Fish Caught: {caughtRecords.length}</div>

      {/* — LIVE FISH SWIMMING AROUND — */}
      {fishArray.map((fish) => {
        const isSuper = SUPER_COLOURS.includes(fish.colour);
        const size = isSuper ? FISH_SIZE * 1.5 : FISH_SIZE;
        return (
          <Fish
            key={fish.id}
            id={fish.id}
            x={fish.x}
            y={fish.y}
            size={size}
            colour={fish.colour}
            pattern={fish.pattern}
            angle={fish.angle}
            speed={speed * fish.speedMult}
            onClick={(e) => handleFishClick(fish.id, e)}
            isMobile={isMobile}
          />
        );
      })}

      {/* — HOOK AS CURSOR ON DESKTOP (only when not catching and welcome is closed) — */}
      {!isCatching && !isMobile && !showWelcome && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* — CAUGHT‐FISH ANIMATIONS — */}
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

      {/* — SETTINGS (cog), INFO, AND CONTROLS (top-left) — */}
      <div className="top-left-ui">
        {/* Cog‐button toggles the controls menu */}
        <button
          className="settings-btn"
          onClick={() => setShowControls((prev) => !prev)}
          aria-label={showControls ? "Hide controls" : "Show controls"}
        >
          {/* Simple cog icon; you can replace with any SVG if you like */}
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

        {/* Info button toggles the info popup */}
        <button
          className="info-btn"
          onClick={() => setShowInfo(true)}
          aria-label="Show fish information"
        >
          ?
        </button>

        {/* Only render Controls if showControls is true */}
        {showControls && (
          <Controls
            onSpeedDown={handleSpeedDown}
            onSpeedUp={handleSpeedUp}
            onAddFish={() => {/* you can re-enable “Add Fish” if desired */}}
            onReset={handleReset}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* — STATS POPUP (Fish Caught) — */}
      {showCaughtPopup && (
        <StatsPopup
          caughtRecords={caughtRecords}
          tally={tally}
          isMobile={isMobile}
          onClose={toggleCaughtPopup}
        />
      )}

      {/* — INFO POPUP (Fish Rarity Info) — */}
      {showInfo && <InfoPopup isMobile={isMobile} onClose={() => setShowInfo(false)} />}
    </div>
  );
}
