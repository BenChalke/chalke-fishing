// src/components/Hook.js
import React from 'react';
import './Hook.css';

/**
 * Hook component: renders
 *  1) a vertical line (“string”) from the top of the viewport down to the hook
 *  2) the hook SVG itself, positioned at (x, y)
 *
 * Props:
 *  - x: clientX coordinate (cursor)
 *  - y: clientY coordinate (cursor)
 *  - jerking: boolean  // if true, play a quick “jerk” animation on the hook
 */
export default function Hook({ x, y, jerking }) {
  // Hook dimensions in px
  const HOOK_WIDTH  = 64;
  const HOOK_HEIGHT = 64;

  // Position the hook SVG so its tip is at (x, y)
  const hookLeft = x - HOOK_WIDTH  / 2;
  const hookTop  = y - HOOK_HEIGHT / 2;

  // Style for the vertical line (string)
  const lineStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `0px`,
    width: '2px',
    height: `${y}px`,
    backgroundColor: '#333333',
    zIndex: 150,             // above popup (100), below hook (200)
    pointerEvents: 'none',
  };

  // Style for the hook itself
  const hookStyle = {
    position: 'absolute',
    left: `${hookLeft}px`,
    top: `${hookTop}px`,
    width: `${HOOK_WIDTH}px`,
    height: `${HOOK_HEIGHT}px`,
    pointerEvents: 'none',
    zIndex: 200,             // topmost
    transform: jerking ? 'scale(1.2)' : 'scale(1)',
    transition: jerking ? 'transform 0.2s ease' : 'transform 0.1s ease',
  };

  return (
    <>
      {/* 1) Vertical fishing line */}
      <div style={lineStyle} />

      {/* 2) Hook SVG */}
      <div className="hook-wrapper" style={hookStyle}>
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
        >
          {/* The hook shape */}
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
          {/* Small accent on the hook */}
          <path
            d="M12 24 L14 26"
            stroke="#333333"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Highlight ellipse */}
          <ellipse cx="20" cy="6" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.5" />
        </svg>
      </div>
    </>
  );
}
