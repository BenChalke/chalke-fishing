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

// Colours and patterns
const COLOURS   = ['orange', 'blue', 'green', 'purple', 'yellow'];
const PATTERNS  = ['solid', 'striped', 'spotted'];

/** 
 * Generate FISH_COUNT fish, each with id, x, y, angle, colour, pattern 
 */
function createInitialFish() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const initialFish = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const x = Math.random() * (width - FISH_SIZE);
    const y = Math.random() * (height - FISH_SIZE / 2);
    const angle = Math.random() * 2 * Math.PI;
    const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    initialFish.push({ id: i, x, y, angle, colour, pattern });
  }
  return initialFish;
}

export default function App() {
  // 1) State: live fish array
  const [fishArray, setFishArray] = useState([]);
  // 2) State: shared speed
  const [speed, setSpeed] = useState(1.5);
  // 3) Cursor tracking + hook jerk
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  // 4) Active catch animations
  const [catchAnimations, setCatchAnimations] = useState([]);
  // 5) Caught‐fish records (array of “Colour Pattern” strings)
  const [caughtRecords, setCaughtRecords] = useState([]);
  // 6) Show/hide caught‐fish popup
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);

  // Refs for cursorPos (inside interval) and next unique ID
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId    = useRef(FISH_COUNT);

  // Populate initial fish on mount
  useEffect(() => {
    setFishArray(createInitialFish());
  }, []);

  // Movement loop (re‐runs when `speed` changes; does NOT re‐init fish)
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

          // Repulsion if cursor is close
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

          // Horizontal bounce (reflect angle over vertical axis)
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - angle;
            dx = Math.cos(newAngle) * speed;
            newX = x + dx;
          }

          // Vertical bounce (reflect angle over horizontal axis)
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

  // Track global mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hook “jerk” on mousedown
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // When user clicks a fish: record its “colour pattern,” remove from array, start catch animation
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    // Find that fish’s data
    const fishObj = fishArray.find((f) => f.id === fishId);
    const { colour, pattern } = fishObj || {};
    const caughtType = `${colour} ${pattern}`; // e.g. “blue striped”
    const { x: curX, y: curY } = cursorPos;

    // Remove from live fish
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));

    // Add to caughtRecords if valid
    if (caughtType) {
      setCaughtRecords((prev) => [...prev, caughtType]);
    }

    // Start catch animation at cursor
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY, colour, pattern },
    ]);
  };

  // Remove a catch‐animation entry when it finishes
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // Reset: clear catches, repopulate fish, reset speed, clear caughtRecords
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
    setCaughtRecords([]);
  };

  // Add one new fish at random pos/angle/colour/pattern
  const handleAddFish = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const angle   = Math.random() * 2 * Math.PI;
    const x       = Math.random() * (w - FISH_SIZE);
    const y       = Math.random() * (h - FISH_SIZE / 2);
    const colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    const newFish = { id: nextId.current, x, y, angle, colour, pattern };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  // Decrease speed by 0.5 (down to MIN_SPEED)
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };

  // Increase speed by 0.5 (up to MAX_SPEED)
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };

  // Toggle the caught‐fish popup
  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

  // Build a tally object: { "blue striped": 3, "orange solid": 1, … }
  const tally = caughtRecords.reduce((acc, typeStr) => {
    acc[typeStr] = (acc[typeStr] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container" onMouseDown={handleMouseDown}>
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

      {/* 3) Cursor hook (hidden during catch) */}
      {!isCatching && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* 4) Catch animations (dead fish + pulling hook) */}
      {catchAnimations.map((anim) => (
        <CatchAnimation
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          fishSize={FISH_SIZE}
          onAnimationEnd={() => handleCatchAnimationEnd(anim.id)}
        >
          {/* Pass in the same Fish component, but with isDead */}
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

      {/* 7) Popup overlay with detailed tally */}
      {showCaughtPopup && (
        <div className="caught-popup-overlay" onClick={toggleCaughtPopup}>
          <div className="caught-popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Fish Caught</h2>
            {caughtRecords.length === 0 ? (
              <p>No fish caught yet.</p>
            ) : (
              <ul>
                {Object.entries(tally).map(([typeStr, count]) => (
                  <li key={typeStr}>
                    {typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}: {count}
                  </li>
                ))}
              </ul>
            )}
            <button className="close-popup-button" onClick={toggleCaughtPopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
