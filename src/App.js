// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Fish from './components/Fish';
import Hook from './components/Hook'; // ← Import Hook component

const FISH_COUNT = 10;
const FISH_SIZE = 120;
const REPULSE_DISTANCE = 100;
const SPEED = 1.5;

function getRandomPosition(maxWidth, maxHeight) {
  const x = Math.random() * (maxWidth - FISH_SIZE);
  const y = Math.random() * (maxHeight - FISH_SIZE / 2);
  return { x, y };
}

function getRandomVelocity() {
  const angle = Math.random() * 2 * Math.PI;
  return { dx: Math.cos(angle) * SPEED, dy: Math.sin(angle) * SPEED };
}

function App() {
  // 1) Fish logic (unchanged)
  const [fishArray, setFishArray] = useState([]);
  const cursorRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const initialFish = [];
    for (let i = 0; i < FISH_COUNT; i++) {
      const { x, y } = getRandomPosition(width, height);
      const { dx, dy } = getRandomVelocity();
      initialFish.push({ id: i, x, y, dx, dy });
    }
    setFishArray(initialFish);

    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return prevFish.map((fish) => {
          let { x, y, dx, dy } = fish;

          // Repulsion logic
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

          // Move fish
          let newX = x + dx;
          let newY = y + dy;

          // Bounce off edges
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            dx = -dx;
            newX = x + dx;
          }
          if (newY <= 0 || newY + FISH_SIZE / 2 >= h) {
            dy = -dy;
            newY = y + dy;
          }

          return { id: fish.id, x: newX, y: newY, dx, dy };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // 2) Track mouse position (for fish repulsion + hook positioning)
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
  };

  // 3) Track mouse‐down to “jerk” the hook
  const [isJerking, setIsJerking] = useState(false);

  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    cursorRef.current = pos;
    setCursorPos(pos);
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300); // match CSS animation duration
  };

  // 4) Catch fish
  const handleFishClick = (id, e) => {
    e.stopPropagation(); // Prevent container’s onMouseDown from also running twice
    alert(`You caught fish #${id + 1}!`);
  };

  return (
    <div
      className="container"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
    >
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

      {/* 5) Render the hook + line */}
      <Hook x={cursorPos.x} y={cursorPos.y} jerking={isJerking} />
    </div>
  );
}

export default App;
