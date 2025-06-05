// src/components/FishField.jsx
import React, { useState, useEffect, useRef } from "react";
import Fish from "./Fish";
import Bubbles from "./Bubbles";
import { createRandomFish } from "../utils/fishUtils"; // ← your helper that returns an object like { id, x, y, angle, colour, pattern, justSpawned, speedMult }

export default function FishField({
  count = 10,
  speed = 1.5,
  isMobile = false,
  isInteractive = false, // on Home we pass false, so fish never repulse
}) {
  const FISH_SIZE = 120;
  const REPULSE_DISTANCE = 100;
  const [fishArray, setFishArray] = useState([]);
  const cursorRef = useRef({ x: -9999, y: -9999 });

  // Next‐ID for spawning (if you ever want to spawn more)
  const nextId = useRef(count);

  // On mount: spawn `count` random fish fully onscreen
  useEffect(() => {
    const initial = [];
    for (let i = 0; i < count; i++) {
      initial.push(createRandomFish(i));
    }
    setFishArray(initial);

    // If interactive is true and desktop, track mouse; on Home, interactive = false => skip
    if (isInteractive && !isMobile) {
      const onMouseMove = (e) => {
        cursorRef.current = { x: e.clientX, y: e.clientY };
      };
      window.addEventListener("mousemove", onMouseMove);
      return () => window.removeEventListener("mousemove", onMouseMove);
    }
  }, [count, isInteractive, isMobile]);

  // Movement loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFishArray((prevFish) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const fishHeight = FISH_SIZE * 0.5;

        return prevFish.map((fish) => {
          let {
            id,
            x,
            y,
            angle,
            colour,
            pattern,
            justSpawned,
            speedMult,
          } = fish;

          const effSpeed = speed * speedMult;

          // —— ENTRY PHASE: justSpawned → swim toward center until fully inside
          if (justSpawned) {
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;
            const angleToCenter = Math.atan2(h / 2 - fishCY, w / 2 - fishCX);
            const dx = Math.cos(angleToCenter) * effSpeed;
            const dy = Math.sin(angleToCenter) * effSpeed;
            const newX = x + dx;
            const newY = y + dy;
            const fullyInside =
              newX >= 0 &&
              newX + FISH_SIZE <= w &&
              newY >= 0 &&
              newY + fishHeight <= h;
            if (fullyInside) {
              return {
                id,
                x: newX,
                y: newY,
                angle: angleToCenter,
                colour,
                pattern,
                justSpawned: false,
                speedMult: 1,
              };
            } else {
              return {
                id,
                x: newX,
                y: newY,
                angle: angleToCenter,
                colour,
                pattern,
                justSpawned: true,
                speedMult: 3, // ENTRY_MULT = 3
              };
            }
          }

          // —— NORMAL PHASE
          let dx = Math.cos(angle) * effSpeed;
          let dy = Math.sin(angle) * effSpeed;

          // If interactive & desktop, check repulsion
          if (isInteractive && !isMobile) {
            const fishCX = x + FISH_SIZE / 2;
            const fishCY = y + fishHeight / 2;
            const diffX = fishCX - cursorRef.current.x;
            const diffY = fishCY - cursorRef.current.y;
            const dist = Math.hypot(diffX, diffY);
            if (dist < REPULSE_DISTANCE) {
              const repelAngle = Math.atan2(diffY, diffX);
              dx = Math.cos(repelAngle) * effSpeed;
              dy = Math.sin(repelAngle) * effSpeed;
              angle = repelAngle;
            }
          }

          let newX = x + dx;
          let newY = y + dy;
          let newAngle = angle;

          // If fish goes fully off any edge, flip 180° and step once
          if (
            newX + FISH_SIZE < 0 ||
            newX > w ||
            newY + fishHeight < 0 ||
            newY > h
          ) {
            newAngle = angle + Math.PI;
            const bx = Math.cos(newAngle) * speed;
            const by = Math.sin(newAngle) * speed;
            newX = x + bx;
            newY = y + by;
          }

          // Bounce horizontally
          if (newX <= 0 || newX + FISH_SIZE >= w) {
            newAngle = Math.PI - newAngle;
            const bounceDX = Math.cos(newAngle) * speed;
            newX = x + bounceDX;
          }
          // Bounce vertically
          if (newY <= 0 || newY + fishHeight >= h) {
            newAngle = -newAngle;
            const bounceDY = Math.sin(newAngle) * speed;
            newY = y + bounceDY;
          }

          return {
            id,
            x: newX,
            y: newY,
            angle: newAngle,
            colour,
            pattern,
            justSpawned: false,
            speedMult: 1,
          };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, [speed, isInteractive, isMobile]);

  return (
    <>
      <Bubbles />
      {fishArray.map((fish) => {
        const isSuper = false; // (you can reuse your SUPER_COLOURS logic if desired here)
        const size = isSuper ? FISH_SIZE * 1.5 : FISH_SIZE;
        return (
          <Fish
            key={fish.id}
            id={fish.id}
            x={fish.x}
            y={fish.y}
            size={size}
            colour={fish.colour}
            pattern={fish.pattern}
            angle={fish.angle}
            speed={speed * fish.speedMult}
            // NO onClick at all → purely decorative
            isMobile={isMobile}
          />
        );
      })}
    </>
  );
}
