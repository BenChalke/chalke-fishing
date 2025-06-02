import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Fish from './components/Fish';
import Hook from './components/Hook';
import Bubbles from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation';

const FISH_COUNT = 10;
const FISH_SIZE = 120;
const REPULSE_DISTANCE = 100;

// Minimum and maximum fish speeds
const MIN_SPEED = 0.5;
const MAX_SPEED = 20.0;

// We now have 7 possible fish types
const FISH_TYPES = [
  'orange',
  'blue',
  'striped',
  'green',
  'purple',
  'yellow',
  'spotted',
];

/** Generates an array of initial fish with random positions, angles, and types */
function createInitialFish() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const initialFish = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const x = Math.random() * (width - FISH_SIZE);
    const y = Math.random() * (height - FISH_SIZE / 2);
    const angle = Math.random() * 2 * Math.PI;
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    initialFish.push({ id: i, x, y, angle, type });
  }
  return initialFish;
}

export default function App() {
  // 1) All live fish: {id, x, y, angle, type}
  const [fishArray, setFishArray] = useState([]);
  // 2) Shared fish speed
  const [speed, setSpeed] = useState(1.5);
  // 3) Cursor + hook state
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  // 4) Active catch animations
  const [catchAnimations, setCatchAnimations] = useState([]);
  // 5) Caught‐fish records: array of types (e.g. ['blue','orange',...])
  const [caughtRecords, setCaughtRecords] = useState([]);
  // 6) Show/hide “caught fish” popup
  const [showCaughtPopup, setShowCaughtPopup] = useState(false);

  // Refs:
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const nextId = useRef(FISH_COUNT);

  // Populate fish once on mount
  useEffect(() => {
    setFishArray(createInitialFish());
  }, []);

  // Fish movement loop (re‐runs when speed changes, but does NOT re-init fish)
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return prevFish.map((fish) => {
          let { id, x, y, angle, type } = fish;
          // Compute dx,dy from angle & current speed
          let dx = Math.cos(angle) * speed;
          let dy = Math.sin(angle) * speed;
          // Repulsion
          const centerX = x + FISH_SIZE / 2;
          const centerY = y + FISH_SIZE / 4;
          const diffX = centerX - cursorRef.current.x;
          const diffY = centerY - cursorRef.current.y;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY);
          if (dist < REPULSE_DISTANCE) {
            const repelAngle = Math.atan2(diffY, diffX);
            dx = Math.cos(repelAngle) * speed;
            dy = Math.sin(repelAngle) * speed;
            angle = repelAngle;
          }
          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;
          // Horizontal bounce
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - angle;
            dx = Math.cos(newAngle) * speed;
            newX = x + dx;
          }
          // Vertical bounce
          if (newY <= 0 || newY + FISH_SIZE / 2 >= h) {
            newAngle = -angle;
            dy = Math.sin(newAngle) * speed;
            newY = y + dy;
          }
          return { id, x: newX, y: newY, angle: newAngle, type };
        });
      });
    }, 30);
    return () => clearInterval(interval);
  }, [speed]);

  // Track global mouse movement (repulsion + hook)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hook “jerk” effect on mousedown
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // When a fish is clicked: record its type, remove fish, start catch animation
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    // Find the fish in fishArray to get its type
    const fishObj = fishArray.find((f) => f.id === fishId);
    const fishType = fishObj ? fishObj.type : null;
    const { x: curX, y: curY } = cursorPos;
    // Remove from fishArray
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));
    // Add to caughtRecords if we have a valid type
    if (fishType) {
      setCaughtRecords((prev) => [...prev, fishType]);
    }
    // Start catch animation
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY },
    ]);
  };

  // Remove a catch animation when it finishes
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  // Reset fish AND speed
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5);
    setCaughtRecords([]); // also clear caught records
  };

  // Add one new fish
  const handleAddFish = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.random() * (w - FISH_SIZE);
    const y = Math.random() * (h - FISH_SIZE / 2);
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    const newFish = { id: nextId.current, x, y, angle, type };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  // Decrease speed by 0.5
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };

  // Increase speed by 0.5
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
  };

  // Toggle the “Fish Caught” popup
  const toggleCaughtPopup = () => {
    setShowCaughtPopup((prev) => !prev);
  };

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
          type={fish.type}
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
        />
      ))}

      {/* 5) Display current speed */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>

      {/* 6) Control buttons in bottom‐right */}
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

      {/* 7) Popup overlay showing caught fish tally */}
      {showCaughtPopup && (
        <div className="caught-popup-overlay" onClick={toggleCaughtPopup}>
          <div className="caught-popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Fish Caught</h2>
            {caughtRecords.length === 0 ? (
              <p>No fish caught yet.</p>
            ) : (
              <ul>
                {FISH_TYPES.map((type) => {
                  const count = caughtRecords.filter((t) => t === type).length;
                  return count > 0 ? (
                    <li key={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
                    </li>
                  ) : null;
                })}
              </ul>
            )}
            <button
              className="close-popup-button"
              onClick={toggleCaughtPopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
