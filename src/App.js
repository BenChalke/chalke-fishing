// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Fish from './components/Fish';
import Hook from './components/Hook';
import Bubbles from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation';

const FISH_COUNT = 10;
const FISH_SIZE = 120;
const REPULSE_DISTANCE = 100;

// Speed bounds
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

// Common colours (used when no rare roll succeeds)
const COLOURS  = ['orange', 'blue', 'green', 'purple', 'yellow'];
const PATTERNS = ['solid', 'striped', 'spotted'];

// Rare colours (1% each on Add Fish)
const RARE_COLOURS = ['red', 'pink', 'silver'];

/** 
 * Generate an array of FISH_COUNT fish with id, x, y, angle, colour, pattern.
 * Rare colours do NOT appear here—they only come in via handleAddFish.
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
  // 1) State: live fish
  const [fishArray, setFishArray] = useState([]);
  // 2) Shared speed
  const [speed, setSpeed] = useState(1.5);
  // 3) Cursor + hook jerk
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  // 4) Active catch animations
  const [catchAnimations, setCatchAnimations] = useState([]);
  // 5) Caught‐fish records (array of “colour pattern” strings)
  const [caughtRecords, setCaughtRecords] = useState([]);
  // 6) Show/hide “Fish Caught” popup
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);
  // 7) Detect mobile (touch) environment
  const [isMobile, setIsMobile] = useState(false);

  // Refs: for mouse repulsion and next unique ID
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_COUNT);

  // On mount: populate initial fish, detect touch support
  useEffect(() => {
    setFishArray(createInitialFish());
    setIsMobile('ontouchstart' in window);
  }, []);

  // Movement loop (re‐runs on speed change; does NOT re‐init fish)
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return prevFish.map((fish) => {
          let { id, x, y, angle, colour, pattern } = fish;
          // Compute dx, dy from angle & speed
          let dx = Math.cos(angle) * speed;
          let dy = Math.sin(angle) * speed;

          // Repulsion if cursor is too close
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

          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;

          // Horizontal bounce: reflect over vertical axis
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - angle;
            dx = Math.cos(newAngle) * speed;
            newX = x + dx;
          }

          // Vertical bounce: reflect over horizontal axis
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
  }, [speed]);

  // Track global mouse movement (for repulsion & hook)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hook “jerk” effect on mousedown / touch
  const handlePointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const pos = { x: clientX, y: clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // When a fish is clicked: record its type, remove, and start catch animation
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const fishObj = fishArray.find((f) => f.id === fishId);
    const { colour, pattern } = fishObj || {};
    const caughtType = `${colour} ${pattern}`;
    const { x: curX, y: curY } = cursorRef.current;

    // Remove from live array
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));

    // Add to caughtRecords if valid
    if (caughtType) {
      setCaughtRecords((prev) => [...prev, caughtType]);
    }

    // Start catch animation
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);
  };

  // Remove one catch-animation entry when done
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // Reset: clear animations, re‐populate fish, reset speed, clear caughtRecords
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
    setCaughtRecords([]);
  };

  // Add Fish:
  //  • 1% chance → red (rare)
  //  • 1% chance → pink (rare)
  //  • 1% chance → silver (rare)
  //  • Else choose random from common COLOURS × PATTERNS
  const handleAddFish = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.random() * (w - FISH_SIZE);
    const y = Math.random() * (h - FISH_SIZE / 2);

    let colour, pattern;
    const roll = Math.random();
    if (roll < 0.01) {
      colour = 'red';
      pattern = 'solid';
    } else if (roll < 0.02) {
      colour = 'pink';
      pattern = 'solid';
    } else if (roll < 0.03) {
      colour = 'silver';
      pattern = 'solid';
    } else {
      colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
      pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    }

    const newFish = { id: nextId.current, x, y, angle, colour, pattern };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  // Decrease speed by 0.5, no lower than MIN_SPEED
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };

  // Increase speed by 0.5, no higher than MAX_SPEED
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };

  // Toggle the “Fish Caught” popup
  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

  // Build a tally: { "red solid": 2, "blue striped": 3, … }
  const tally = caughtRecords.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container" onMouseDown={handlePointerDown} onTouchStart={handlePointerDown}>
      {/* 1) Bubbles */}
      <Bubbles />

      {/* 2) Live fish */}
      {fishArray.map((fish) => (
        <Fish
          key={fish.id}
          id={fish.id}
          x={fish.x}
          y={fish.y}
          size={FISH_SIZE}
          colour={fish.colour}
          pattern={fish.pattern}
          onClick={(e) => handleFishClick(fish.id, e)}
        />
      ))}

      {/* 3) Cursor hook (desktop only, hidden if catching or on mobile) */}
      {!isCatching && !isMobile && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* 4) Catch animations (hook + dead fish) */}
      {catchAnimations.map((anim) => (
        <CatchAnimation
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          fishSize={FISH_SIZE}
          onAnimationEnd={() => handleCatchAnimationEnd(anim.id)}
        >
          {/* During catch, always show hook + dead fish (regardless of mobile) */}
          <Hook x={anim.startX} y={anim.startY} jerking={false} />
          <Fish
            x={0}
            y={0}
            size={FISH_SIZE}
            colour={anim.colour}
            pattern={anim.pattern}
            isDead={true}
          />
        </CatchAnimation>
      ))}

      {/* 5) Display current speed */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>

      {/* 6) Control buttons */}
      <button className="control-button speed-down" onClick={handleSpeedDown}>
        Speed–
      </button>
      <button className="control-button speed-up" onClick={handleSpeedUp}>
        Speed+
      </button>
      <button className="control-button add-button" onClick={handleAddFish}>
        Add Fish
      </button>
      <button className="control-button reset-button" onClick={handleReset}>
        Reset Fish
      </button>
      <button className="control-button caught-button" onClick={toggleCaughtPopup}>
        Fish Caught
      </button>

      {/* 7) “Fish Caught” popup with sorted stats and top-right close */}
      {showCaughtPopup && (
        <div className="caught-popup-overlay" onClick={toggleCaughtPopup}>
          <div className="caught-popup-content" onClick={(e) => e.stopPropagation()}>
            {/* Top-right “X” close button */}
            <button className="popup-close-x" onClick={toggleCaughtPopup}>
              ×
            </button>
            <h2>Fish Caught</h2>
            {/* Scrollable stats area */}
            <div className="popup-body">
              {caughtRecords.length === 0 ? (
                <p>No fish caught yet.</p>
              ) : (
                <div>
                  {/* a) Render all rare fish first */}
                  <ul>
                    {Object.entries(tally)
                      .filter(([typeStr]) => {
                        const [colour] = typeStr.split(' ');
                        return RARE_COLOURS.includes(colour);
                      })
                      .map(([typeStr, count]) => {
                        const [colour, pattern] = typeStr.split(' ');
                        const capitalized = typeStr
                          .split(' ')
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ');
                        return (
                          <li key={typeStr} className="caught-item">
                            <div className="mini-fish-container">
                              <Fish
                                x={0}
                                y={0}
                                size={40}
                                colour={colour}
                                pattern={pattern}
                                isDead={false}
                              />
                            </div>
                            <span className="rare-label">
                              <strong>Rare {capitalized}:</strong> {count}
                            </span>
                          </li>
                        );
                      })}
                  </ul>

                  {/* b) Now group and render common fish by colour */}
                  {(() => {
                    // Filter common entries and group by colour
                    const commonEntries = Object.entries(tally).filter(
                      ([typeStr]) => {
                        const [colour] = typeStr.split(' ');
                        return !RARE_COLOURS.includes(colour);
                      }
                    );
                    const commonByColour = {};
                    commonEntries.forEach(([typeStr, count]) => {
                      const [colour, pattern] = typeStr.split(' ');
                      if (!commonByColour[colour]) {
                        commonByColour[colour] = [];
                      }
                      commonByColour[colour].push({ pattern, count });
                    });

                    return Object.keys(commonByColour).map((colour) => {
                      const colourHeading =
                        colour.charAt(0).toUpperCase() + colour.slice(1);
                      return (
                        <div key={colour} className="common-group">
                          <h3>{colourHeading}</h3>
                          <ul>
                            {commonByColour[colour].map(({ pattern, count }) => {
                              const patternLabel =
                                pattern.charAt(0).toUpperCase() + pattern.slice(1);
                              const typeStr = `${colour} ${pattern}`;
                              return (
                                <li key={typeStr} className="caught-item">
                                  <div className="mini-fish-container">
                                    <Fish
                                      x={0}
                                      y={0}
                                      size={40}
                                      colour={colour}
                                      pattern={pattern}
                                      isDead={false}
                                    />
                                  </div>
                                  <span>
                                    {patternLabel}: {count}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
