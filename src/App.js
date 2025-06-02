// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Fish from './components/Fish';
import Hook from './components/Hook';
import Bubbles from './components/Bubbles';
import CatchAnimation from './components/CatchAnimation'; // assume you extracted it to its own file

const FISH_COUNT = 10;
const FISH_SIZE = 120;
const REPULSE_DISTANCE = 100;
const SPEED = 3;

function App() {
  // 1) Fish movement logic (unchanged)
  const [fishArray, setFishArray] = useState([]);
  const cursorRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const initialFish = [];
    for (let i = 0; i < FISH_COUNT; i++) {
      const x = Math.random() * (width - FISH_SIZE);
      const y = Math.random() * (height - FISH_SIZE / 2);
      const angle = Math.random() * 2 * Math.PI;
      initialFish.push({
        id: i,
        x,
        y,
        dx: Math.cos(angle) * SPEED,
        dy: Math.sin(angle) * SPEED,
      });
    }
    setFishArray(initialFish);

    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return prevFish.map((fish) => {
          let { x, y, dx, dy, id } = fish;
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

          return { id, x: newX, y: newY, dx, dy };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // 2) Track global mouse position
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      cursorRef.current = pos;
      setCursorPos(pos);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // 3) Hook “jerk” on mousedown
  const [isJerking, setIsJerking] = useState(false);
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  // 4) Catch animations state (each entry = one active pull)
  const [catchAnimations, setCatchAnimations] = useState([]);
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    const { x: curX, y: curY } = cursorPos;
    setFishArray((prev) => prev.filter((f) => f.id !== fishId));
    // Add a new catch animation at this cursor
    setCatchAnimations((prev) => [
      ...prev,
      { id: fishId, startX: curX, startY: curY },
    ]);
  };

  const handleCatchAnimationEnd = (animId) => {
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));
  };

  // 5) Determine if ANY catch animation is active
  const isCatching = catchAnimations.length > 0;

  return (
    <div className="container" onMouseDown={handleMouseDown}>
      {/* 1) Seaweed in the background (unchanged from before) */}
      {/* <Seaweed /> */}

      {/* 2) Bubbles */}
      <Bubbles />

      {/* 3) Fish */}
      {fishArray.map((fish) => (
        <Fish
          key={fish.id}
          id={fish.id}
          x={fish.x}
          y={fish.y}
          size={FISH_SIZE}
          onClick={(e) => handleFishClick(fish.id, e)}
        />
      ))}

      {/* 4) Only render the “cursor hook” when we are NOT currently catching */}
      {!isCatching && (
        <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
      )}

      {/* 5) Active catch animations (each shows its own pulling hook + fish) */}
      {catchAnimations.map((anim) => (
        <CatchAnimation
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          fishSize={FISH_SIZE}
          onAnimationEnd={() => handleCatchAnimationEnd(anim.id)}
        />
      ))}
    </div>
  );
}

export default App;
