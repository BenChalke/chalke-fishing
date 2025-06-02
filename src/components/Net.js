// src/components/Net.js
import React, { useEffect, useRef } from 'react';
import './Net.css';

function Net({ x, y, swinging }) {
  const netRef = useRef(null);

  useEffect(() => {
    if (swinging && netRef.current) {
      netRef.current.classList.add('swing');
      const timeout = setTimeout(() => {
        if (netRef.current) netRef.current.classList.remove('swing');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [swinging]);

  // The SVG is 64px wide, so subtract 32 to center under the cursor.
  // We do NOT subtract any vertical offset, because the top of the SVG (y=0) is the top of the handle.
  const style = {
    left: `${x - 32}px`,
    top: `${y}px`,
  };

  return (
    <div className="net-wrapper" style={style} ref={netRef}>
      <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" width="64" height="80">
        {/* 1) Wooden grip */}
        <rect
          x="26"
          y="0"
          width="16"
          height="28"
          fill="#A0522D"
          stroke="#000000"
          strokeWidth="2"
          rx="4"
        />

        {/* 2) Metal shaft below grip */}
        <rect
          x="29"
          y="28"
          width="6"
          height="24"
          fill="#C0C0C0"
          stroke="#000000"
          strokeWidth="1"
        />

        {/* 3) Net rim (brown ellipse) */}
        <ellipse
          cx="32"
          cy="56"
          rx="24"
          ry="10"
          fill="#8B4513"
          stroke="#000000"
          strokeWidth="2"
        />

        {/* 4) Net bag (light blue conical shape) */}
        <path
          d="M12,56 C20,82 44,82 52,56 Z"
          fill="#ADD8E6"
          stroke="#000000"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* 5) Mesh lines inside the net */}
        <g stroke="#000000" strokeWidth="0.9" opacity="0.8">
          {/* Vertical-ish lines */}
          <path d="M20,56 L26,82" />
          <path d="M28,56 L32,82" />
          <path d="M36,56 L38,82" />

          {/* Horizontal curved lines */}
          <path d="M14,62 Q32,75 50,62" fill="none" />
          <path d="M18,70 Q32,85 46,70" fill="none" />
        </g>
      </svg>
    </div>
  );
}

export default Net;
