// src/components/Bubbles.js
import React, { useState, useEffect, useRef } from 'react';
import './Bubbles.css';

let nextId = 0;

function Bubbles() {
  const [bubbles, setBubbles] = useState([]);
  const spawnTimeout = useRef(null);

  const spawnBubble = () => {
    const id = nextId++;
    const screenWidth = window.innerWidth;
    const x = Math.random() * (screenWidth - 40);

    // Three size categories: tiny (8-12px), small (14-22px), medium (24-35px)
    const roll = Math.random();
    let size;
    if (roll < 0.50) {
      size = Math.random() * 4  + 8;   // tiny
    } else if (roll < 0.80) {
      size = Math.random() * 8  + 14;  // small
    } else {
      size = Math.random() * 11 + 24;  // medium
    }

    // Random horizontal drift and rise duration
    const drift    = (Math.random() - 0.5) * 44;
    const duration = 3 + Math.random() * 3;  // 3–6s

    setBubbles((prev) => [
      ...prev,
      { id, x, size, drift, duration },
    ]);

    const nextDelay = Math.random() * 1000 + 500;
    spawnTimeout.current = setTimeout(spawnBubble, nextDelay);
  };

  useEffect(() => {
    spawnBubble();
    return () => {
      clearTimeout(spawnTimeout.current);
    };
  }, []);

  const handleAnimationEnd = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left:       `${b.x}px`,
            width:      `${b.size}px`,
            height:     `${b.size}px`,
            '--drift':    `${b.drift}px`,
            '--duration': `${b.duration}s`,
          }}
          onAnimationEnd={() => handleAnimationEnd(b.id)}
        />
      ))}
    </>
  );
}

export default Bubbles;
