// src/components/Bubbles.js
import React, { useState, useEffect, useRef } from 'react';
import './Bubbles.css';

let nextId = 0;

function Bubbles() {
  const [bubbles, setBubbles] = useState([]);
  const spawnTimeout = useRef(null);

  // Function to spawn a single bubble with random parameters
  const spawnBubble = () => {
    const id = nextId++;
    const screenWidth = window.innerWidth;
    // Randomize horizontal position anywhere across the viewport:
    const x = Math.random() * (screenWidth - 20); // minus a max bubble size for margin
    // Randomize bubble diameter between 10px and 30px:
    const size = Math.random() * 20 + 10;

    setBubbles((prev) => [
      ...prev,
      { id, x, size }
    ]);

    // Schedule next bubble spawn in 500–1500ms:
    const nextDelay = Math.random() * 1000 + 500;
    spawnTimeout.current = setTimeout(spawnBubble, nextDelay);
  };

  useEffect(() => {
    // Kick off the first spawn immediately:
    spawnBubble();
    return () => {
      clearTimeout(spawnTimeout.current);
    };
  }, []);

  // Remove a bubble after its animation ends
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
            left: `${b.x}px`,
            width: `${b.size}px`,
            height: `${b.size}px`
          }}
          onAnimationEnd={() => handleAnimationEnd(b.id)}
        />
      ))}
    </>
  );
}

export default Bubbles;
