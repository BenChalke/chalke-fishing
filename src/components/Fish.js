import React from 'react';
import './Fish.css';

function Fish({ id, x, y, size, onClick }) {
  // Position the wrapper at (x,y), and make it `size` px wide, `size/2` px tall:
  const style = {
    left: x,
    top: y,
    width: `${size}px`,
    height: `${size / 2}px`,
  };

  return (
    <div className="fish" style={style} onClick={onClick}>
      <svg
        viewBox="0 0 100 50"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tail: yellow triangle on left */}
        <polygon
          className="fish-tail"
          points="10,25 0,10 0,40"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="2"
        />

        {/* Body: orange ellipse */}
        <ellipse
          className="fish-body"
          cx="50"
          cy="25"
          rx="40"
          ry="20"
          fill="#FFA500"
          stroke="#FF8C00"
          strokeWidth="2"
        />

        {/* Head: red circle on the right */}
        <circle
          className="fish-head"
          cx="75"
          cy="25"
          r="15"
          fill="#FF4500"
          stroke="#FF8C00"
          strokeWidth="2"
        />

        {/* Dorsal Fin (top): small darker‐orange triangle */}
        <polygon
          className="fish-fin"
          points="50,5 60,15 40,15"
          fill="#FF8C00"
          stroke="#FF8C00"
          strokeWidth="1"
        />

        {/* Eye: white circle with black pupil */}
        <circle
          className="fish-eye"
          cx="82"
          cy="20"
          r="4"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1"
        />
        <circle
          className="fish-eye-pupil"
          cx="82"
          cy="20"
          r="2"
          fill="#000000"
        />
      </svg>
    </div>
  );
}

export default Fish;
