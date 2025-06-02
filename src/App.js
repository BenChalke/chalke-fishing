import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Fish from './components/Fish';
import Hook from './components/Hook';
import Bubbles from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation';

const FISH_COUNT = 10;
const FISH_SIZE = 120;
const REPULSE_DISTANCE = 100;
const SPEED = 1.5;

// Available fish types
const FISH_TYPES = ['orange', 'blue', 'striped', 'green'];

/** Helper to create an initial array of FISH_COUNT fish */
function createInitialFish() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const initialFish = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const x = Math.random() * (width - FISH_SIZE);
    const y = Math.random() * (height - FISH_SIZE / 2);
    const angle = Math.random() * 2 * Math.PI;
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
  // 1) State for all live fish
  const [fishArray, setFishArray] = useState([]);
  // 2) Cursor position & hook‐jerk logic
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking] = useState(false);
  // 3) Ongoing catch animations
  const [catchAnimations, setCatchAnimations] = useState([]);
  // 4) A ref to hold the next unique fish ID
  const nextId = useRef(FISH_COUNT);

  // Ref to always read the latest cursor position inside movement loop
  const cursorRef = useRef({ x: -1000, y: -1000 });

  // On mount: populate initial fish and start movement loop
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

  // Track global mouse movement for both repulsion and hook position
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Hook “jerk” animation on mousedown
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // When a fish is clicked: remove it and start its catch animation
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const { x: curX, y: curY } = cursorPos;
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY },
    ]);
  };

  // Remove a catch animation once pull‐up finishes
  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  // Are we currently catching? (hide cursor‐hook if true)
  const isCatching = catchAnimations.length > 0;

  // Reset: clear catches and repopulate fish (and reset nextId)
  const handleReset = () => {
    setCatchAnimations([]);
    setFishArray(createInitialFish());
    nextId.current = FISH_COUNT;
  };

  // Add Fish: create one new fish with a unique ID and random attributes
  const handleAddFish = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const angle = Math.random() * 2 * Math.PI;
    const x = Math.random() * (width - FISH_SIZE);
    const y = Math.random() * (height - FISH_SIZE / 2);
    const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    const newFish = {
      id: nextId.current,
      x,
      y,
      dx: Math.cos(angle) * SPEED,
      dy: Math.sin(angle) * SPEED,
      type,
    };
    nextId.current += 1;
    setFishArray((prev) => [...prev, newFish]);
  };

  return (
    <div className="container" onMouseDown={handleMouseDown}>
      {/* 1) Bubbles */}
      <Bubbles />

      {/* 2) Live fish (various types) */}
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

      {/* 3) Cursor hook, but only when not currently catching */}
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

      {/* 5) “Add Fish” and “Reset Fish” buttons in bottom‐right */}
      <button className="add-button" onClick={handleAddFish}>
        Add Fish
      </button>
      <button className="reset-button" onClick={handleReset}>
        Reset Fish
      </button>
    </div>
  );
}

export default App;
