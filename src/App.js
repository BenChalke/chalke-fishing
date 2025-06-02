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

const FISH_TYPES = ['orange', 'blue', 'striped', 'green'];

/** Generates an initial array of fish (id, x, y, angle, type) */
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

function App() {
  // 1) State for all fish
  const [fishArray, setFishArray] = useState([]);
  // 2) Shared speed for every fish
  const [speed, setSpeed] = useState(1.5);
  // 3) Cursor position & hook‐jerk
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  // 4) Ongoing catch animations
  const [catchAnimations, setCatchAnimations] = useState([]);

  // Ref to keep latest cursor position inside the movement loop
  const cursorRef = useRef({ x: -1000, y: -1000 });
  // Ref to generate unique IDs for newly added fish
  const nextId = useRef(FISH_COUNT);

  // Populate fish once on mount
  useEffect(() => {
    setFishArray(createInitialFish());
  }, []);

  // Movement loop: recalculates positions whenever speed changes
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        return prevFish.map((fish) => {
          let { id, x, y, angle, type } = fish;

          // Compute dx, dy from angle & current speed
          let dx = Math.cos(angle) * speed;
          let dy = Math.sin(angle) * speed;

          // Repulsion if cursor is close
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

          // Horizontal bounce: reflect angle
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - angle;
            dx = Math.cos(newAngle) * speed;
            newX = x + dx;
          }

          // Vertical bounce: reflect angle
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

  // Track global mouse movement (for repulsion & hook)
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Hook “jerk” feedback on mousedown
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // When a fish is clicked: remove it + start its catch animation
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const { x: curX, y: curY } = cursorPos;
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));
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

  // Reset: clear catches, repopulate fish, and reset speed to 1.5
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
    setSpeed(1.5); // ← also reset speed here
  };

  // Add one new fish at random pos/angle/type
  const handleAddFish = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.random() * (width - FISH_SIZE);
    const y = Math.random() * (height - FISH_SIZE / 2);
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    const newFish = { id: nextId.current, x, y, angle, type };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  // Decrease speed by 0.5, down to MIN_SPEED
  const handleSpeedDown = () => {
    setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  };

  // Increase speed by 0.5, up to MAX_SPEED (20.0)
  const handleSpeedUp = () => {
    setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));
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

      {/* 3) Cursor hook (hidden if catching) */}
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

      {/* 6) Control buttons in bottom‐right: Speed–, Speed+, Add Fish, Reset Fish */}
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
    </div>
  );
}

export default App;
