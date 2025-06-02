// src/components/Hook.js
import React, { useEffect, useRef } from 'react';
import './Hook.css';

function Hook({ x, y, jerking }) {
  const hookRef = useRef(null);

  useEffect(() => {
    if (jerking && hookRef.current) {
      hookRef.current.classList.add('jerk');
      const timeout = setTimeout(() => {
        if (hookRef.current) hookRef.current.classList.remove('jerk');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [jerking]);

  // Calculate the hook’s top‐edge y‐coordinate:
  const hookTopY = y - 32;
  // Ensure the line height never goes negative:
  const lineHeight = hookTopY > 0 ? hookTopY : 0;

  // 1) Vertical fishing line now goes from top:0 down to hookTopY:
  const lineStyle = {
    left: `${x}px`,
    height: `${lineHeight}px`,
  };

  // 2) Position the hook SVG so its bottom (tip) is at (x, y):
  const hookStyle = {
    left: `${x - 32}px`,    // center 64px-wide SVG under the cursor
    top: `${hookTopY}px`,   // place top of SVG at y - 64
  };

  return (
    <>
      {/* 1) Vertical fishing line */}
      <div className="fishing-line" style={lineStyle} />

      {/* 2) Hook SVG */}
      <div className="hook-wrapper" style={hookStyle} ref={hookRef}>
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
        >
          {/* Main hook shape */}
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
          {/* Barb detail */}
          <path
            d="M12 24 L14 26"
            stroke="#333333"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* White highlight */}
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
    </>
  );
}

export default Hook;
