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

  // If x/y are way off (e.g. -1000), you could skip rendering, but since
  // we control via App whether to render the Hook at all (via isCatching),
  // we can simply always render it when called.

  // Position the top of the hook at (y - 64) and center it at (x)
  const hookTop = y - 32;
  const lineHeight = hookTop > 0 ? hookTop : 0;

  return (
    <>
      <div className="fishing-line" style={{ left: x + 'px', height: lineHeight + 'px' }} />
      <div
        className="hook-wrapper"
        style={{ left: `${x - 32}px`, top: `${hookTop}px` }}
        ref={hookRef}
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
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
          <path d="M12 24 L14 26" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="20" cy="6" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.5" />
        </svg>
      </div>
    </>
  );
}

export default Hook;
