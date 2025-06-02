// src/components/CatchAnimation.js
import React from 'react';
import Fish from './Fish'; 
import './CatchAnimation.css';

/**
 * CatchAnimation uses the Fish component to show a “dead” fish being pulled up.
 *
 * Props:
 *  - startX, startY: coordinates where the fish & hook began (when clicked)
 *  - fishSize: numeric width in px for the fish
 *  - onAnimationEnd: callback to remove this animation entry when done
 */
export default function CatchAnimation({
  startX,
  startY,
  fishSize,
  onAnimationEnd
}) {
  // Position the hook (64px tall)
  const hookTop = startY - 64;
  const hookLeft = startX - 32;

  // Fish dimensions & positioning
  const fishWidth = fishSize;       
  const fishHeight = fishSize / 2; 
  const fishLeft = startX - fishWidth / 2;
  const fishTop = startY - fishHeight;

  return (
    <>
      {/* 1) The “pulling” line (animates upward) */}
      <div
        className="fishing-line caught"
        style={{
          left: `${startX}px`,
          height: `${hookTop > 0 ? hookTop : 0}px`,
        }}
      />

      {/* 2) The “pulling” hook (animates upward) */}
      <div
        className="hook-wrapper caught"
        style={{ left: `${hookLeft}px`, top: `${hookTop}px` }}
      >
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
        >
          <path
            d="
              M16 0
              L16 8
              C16 16, 12 20, 12 24
              C12 28, 16 32, 20 28
              C24 24, 26 20, 22 16
            "
            fill="none"
            stroke="#333333"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 24 L14 26"
            stroke="#333333"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse
            cx="20"
            cy="6"
            rx="3"
            ry="1.5"
            fill="#FFFFFF"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* 3) The “dead” fish being pulled up */}
      <div
        className="fish-caught"
        style={{
          left: `${fishLeft}px`,
          top: `${fishTop}px`,
          width: `${fishWidth}px`,
          height: `${fishHeight}px`,
        }}
        onAnimationEnd={onAnimationEnd}
      >
        {/* Render the Fish component in “dead” mode */}
        <Fish
          x={0}
          y={0}
          size={fishSize}
          isDead={true}
        />
      </div>
    </>
  );
}
