// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Fish from './components/Fish';
import Hook from './components/Hook';
import Bubbles from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation';
// Seaweed removed per your previous step

const FISH_COUNT = 10;
const FISH_SIZE = 120;
const REPULSE_DISTANCE = 100;
const SPEED = 1.5;

/**
 * Available fish “types”:
 *  - orange: the classic
 *  - blue: a bluish variant
 *  - striped: alternating stripes
 *  - green: a green‐toned fish
 */
const FISH_TYPES = ['orange', 'blue', 'striped', 'green'];

/**
 * Helper: generate an array of fish objects with random positions, directions, and types.
 */
function createInitialFish() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const initialFish = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const x = Math.random() * (width - FISH_SIZE);
    const y = Math.random() * (height - FISH_SIZE / 2);
    const angle = Math.random() * 2 * Math.PI;
    // Choose a random type:
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    initialFish.push({
      id: i,
      x,
      y,
      dx: Math.cos(angle) * SPEED,
      dy: Math.sin(angle) * SPEED,
      type,
    });
  }
  return initialFish;
}

function App() {
  const [fishArray, setFishArray] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);

  const cursorRef = useRef({ x: -1000, y: -1000 });

  // On mount: populate fish + start movement loop
  useEffect(() => {
    setFishArray(createInitialFish());

    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return prevFish.map((fish) => {
          let { x, y, dx, dy, id, type } = fish;
          const centerX = x + FISH_SIZE / 2;
          const centerY = y + FISH_SIZE / 4;
          const diffX = centerX - cursorRef.current.x;
          const diffY = centerY - cursorRef.current.y;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY);

          if (dist < REPULSE_DISTANCE) {
            const angle = Math.atan2(diffY, diffX);
            dx = Math.cos(angle) * SPEED;
            dy = Math.sin(angle) * SPEED;
          }

          let newX = x + dx;
          let newY = y + dy;

          if (newX <= 0 || newX + FISH_SIZE >= w) {
            dx = -dx;
            newX = x + dx;
          }
          if (newY <= 0 || newY + FISH_SIZE / 2 >= h) {
            dy = -dy;
            newY = y + dy;
          }

          return { id, x: newX, y: newY, dx, dy, type };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Track global mouse position
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Hook “jerk” on mousedown
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // When a fish is clicked
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const { x: curX, y: curY } = cursorPos;
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY },
    ]);
  };

  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  const isCatching = catchAnimations.length > 0;

  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
  };

  return (
    <div className="container" onMouseDown={handleMouseDown}>
      {/* Bubbles */}
      <Bubbles />

      {/* Live fish (with random types) */}
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

      {/* Cursor hook, only when not pulling */}
      {!isCatching && <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />}

      {/* Catch animations (dead fish + pulling hook) */}
      {catchAnimations.map((anim) => (
        <CatchAnimation
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          fishSize={FISH_SIZE}
          onAnimationEnd={() => handleCatchAnimationEnd(anim.id)}
        />
      ))}

      {/* Reset button */}
      <button className="reset-button" onClick={handleReset}>
        Reset Fish
      </button>
    </div>
  );
}

export default App;
