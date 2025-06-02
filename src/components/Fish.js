import React from 'react';
import './Fish.css';

/**
 * Fish component with a more realistic fish silhouette:
 *
 * Props:
 *  - x: left (px)
 *  - y: top (px)
 *  - size: width in px (height = size × 0.5)
 *  - onClick: function to call when clicked (optional)
 *  - isDead: boolean; if true, draw a red cross over the eye
 */
export default function Fish({ x, y, size, onClick, isDead }) {
  const fishWidth = size;
  const fishHeight = size * 0.5; // maintain a 2:1 ratio

  const wrapperStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${fishWidth}px`,
    height: `${fishHeight}px`,
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <div style={wrapperStyle} onClick={onClick}>
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        {/* 1) Main body */}
        <path
          d="
            M20 50
            C20 20, 80 0, 120 20
            C160 40, 160 60, 120 80
            C80 100, 20 80, 20 50
            Z
          "
          fill={isDead ? '#777777' : '#FFA500'}
          stroke={isDead ? '#555555' : '#FF8C00'}
          strokeWidth="4"
        />

        {/* 2) Tail */}
        <path
          d="
            M20 50
            L0 30
            L0 70
            Z
          "
          fill={isDead ? '#555555' : '#FF8C00'}
          stroke={isDead ? '#333333' : '#E07000'}
          strokeWidth="3"
        />

        {/* 3) Top dorsal fin */}
        <path
          d="
            M60 20
            C50 0, 80 10, 90 20
            Z
          "
          fill={isDead ? '#666666' : '#FFD27F'}
          stroke={isDead ? '#444444' : '#FFB347'}
          strokeWidth="2"
        />

        {/* 4) Bottom pelvic fin */}
        <path
          d="
            M60 80
            C50 100, 80 90, 90 80
            Z
          "
          fill={isDead ? '#666666' : '#FFD27F'}
          stroke={isDead ? '#444444' : '#FFB347'}
          strokeWidth="2"
        />

        {/* 5) Eye (white circle) */}
        <circle
          cx="140"
          cy="35"
          r="8"
          fill={isDead ? '#CCCCCC' : '#FFFFFF'}
        />
        {/* 6) Pupil (black) */}
        <circle
          cx="140"
          cy="35"
          r="4"
          fill={isDead ? '#333333' : '#000000'}
        />

        {/* 7) “✕” over eye if dead */}
        {isDead && (
          <g stroke="#FF0000" strokeWidth="3">
            <line x1="136" y1="31" x2="144" y2="39" />
            <line x1="144" y1="31" x2="136" y2="39" />
          </g>
        )}
      </svg>
    </div>
  );
}
