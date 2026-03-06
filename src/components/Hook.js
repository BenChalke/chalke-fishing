// src/components/Hook.js
import React from 'react';
import './Hook.css';

/**
 * Hook component: renders
 *  1) a vertical line ("string") from the top of the viewport down to the hook
 *  2) the hook SVG itself, positioned at (x, y)
 *
 * Props:
 *  - x: clientX coordinate (cursor)
 *  - y: clientY coordinate (cursor)
 *  - jerking: boolean  // if true, play a quick "jerk" animation on the hook
 */
export default function Hook({ x, y, jerking }) {
  const HOOK_WIDTH  = 64;
  const HOOK_HEIGHT = 64;

  const hookLeft = x - HOOK_WIDTH  / 2;
  const hookTop  = y - HOOK_HEIGHT / 2;

  // Fishing line: slightly blue-tinted to blend with water, semi-transparent
  const lineStyle = {
    position:        'absolute',
    left:            `${x}px`,
    top:             '0px',
    width:           '1.5px',
    height:          `${y}px`,
    backgroundColor: '#4a6a8a',
    opacity:         0.7,
    zIndex:          150,
    pointerEvents:   'none',
  };

  const hookStyle = {
    position:   'absolute',
    left:       `${hookLeft}px`,
    top:        `${hookTop}px`,
    width:      `${HOOK_WIDTH}px`,
    height:     `${HOOK_HEIGHT}px`,
    pointerEvents: 'none',
    zIndex:     200,
    transform:  jerking ? 'scale(1.2)' : 'scale(1)',
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
          <defs>
            <linearGradient id="hook-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#D0D0D0" />
              <stop offset="50%"  stopColor="#AAAAAA" />
              <stop offset="100%" stopColor="#888888" />
            </linearGradient>
          </defs>

          {/* Hook shape with metallic gradient stroke */}
          <path
            d="
              M16 0
              L16 8
              C16 16, 12 20, 12 24
              C12 28, 16 32, 20 28
              C24 24, 26 20, 22 16
            "
            fill="none"
            stroke="url(#hook-metal)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Barb accent */}
          <path
            d="M12 24 L14 26"
            stroke="url(#hook-metal)"
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
