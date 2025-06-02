import React from 'react';
import './Fish.css';

/**
 * Fish component with separate colour + pattern.
 *
 * Props:
 *  - x: left (px)
 *  - y: top (px)
 *  - size: width in px (height = size × 0.5)
 *  - onClick: callback when fish is clicked
 *  - isDead: boolean; if true, draw a red “✕” on the eye
 *  - colour: one of 'orange','blue','green','purple','yellow'
 *  - pattern: one of 'solid','striped','spotted'
 */
export default function Fish({ x, y, size, onClick, isDead, colour, pattern }) {
  const fishWidth = size;
  const fishHeight = size * 0.5;

  const wrapperStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${fishWidth}px`,
    height: `${fishHeight}px`,
    cursor: onClick ? 'pointer' : 'default',
  };

  // Determine fill/stroke based on colour & isDead
  let bodyFill, bodyStroke, tailFill, tailStroke, finFill, finStroke, eyeFill;

  switch (colour) {
    case 'blue':
      bodyFill = isDead ? '#556B7D' : '#4A90E2';
      bodyStroke = isDead ? '#3A556A' : '#336FB3';
      tailFill = isDead ? '#3A556A' : '#336FB3';
      tailStroke = isDead ? '#1F2F3C' : '#1E4F7A';
      finFill = isDead ? '#6D8CA5' : '#7FB3E6';
      finStroke = isDead ? '#4D6190' : '#4A7FB3';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
    case 'green':
      bodyFill = isDead ? '#667B6F' : '#3CB371';
      bodyStroke = isDead ? '#4D6053' : '#29875A';
      tailFill = isDead ? '#4D6053' : '#29875A';
      tailStroke = isDead ? '#2F3B32' : '#1F533A';
      finFill = isDead ? '#7FAE97' : '#7CFC00';
      finStroke = isDead ? '#5F8067' : '#5EB700';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
    case 'purple':
      bodyFill = isDead ? '#766D87' : '#8A2BE2';
      bodyStroke = isDead ? '#5A5870' : '#6529C7';
      tailFill = isDead ? '#5A5870' : '#6529C7';
      tailStroke = isDead ? '#3C3B4C' : '#321995';
      finFill = isDead ? '#9B94A8' : '#B266E6';
      finStroke = isDead ? '#7D7190' : '#8033C2';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
    case 'yellow':
      bodyFill = isDead ? '#A69A56' : '#FFD700';
      bodyStroke = isDead ? '#7F763F' : '#E6B800';
      tailFill = isDead ? '#7F763F' : '#E6B800';
      tailStroke = isDead ? '#605C2C' : '#B38C00';
      finFill = isDead ? '#BFB56C' : '#FFEA5C';
      finStroke = isDead ? '#9C964A' : '#C7B047';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
    case 'spotted':
      // Teal for spotted
      bodyFill = isDead ? '#5B7A7A' : '#20B2AA';
      bodyStroke = isDead ? '#3F5555' : '#1F8F85';
      tailFill = isDead ? '#3F5555' : '#1F8F85';
      tailStroke = isDead ? '#2A3A3A' : '#14514D';
      finFill = isDead ? '#79A5A5' : '#40C2B6';
      finStroke = isDead ? '#617A7A' : '#329990';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
    default: // 'orange'
      bodyFill = isDead ? '#777777' : '#FFA500';
      bodyStroke = isDead ? '#555555' : '#FF8C00';
      tailFill = isDead ? '#555555' : '#E07000';
      tailStroke = isDead ? '#333333' : '#CC5500';
      finFill = isDead ? '#888888' : '#FFD27F';
      finStroke = isDead ? '#666666' : '#FFB347';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
  }

  return (
    <div style={wrapperStyle} onClick={onClick}>
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        {/* 1) Define clipPath for the body (used by stripes/spots) */}
        <defs>
          <clipPath id="clip-body">
            <path
              d="
                M20 50
                C20 20, 80 0, 120 20
                C160 40, 160 60, 120 80
                C80 100, 20 80, 20 50
                Z
              "
            />
          </clipPath>
        </defs>

        {/* 2) Body */}
        <path
          d="
            M20 50
            C20 20, 80 0, 120 20
            C160 40, 160 60, 120 80
            C80 100, 20 80, 20 50
            Z
          "
          fill={bodyFill}
          stroke={bodyStroke}
          strokeWidth="4"
        />

        {/* 3) If striped (and not dead), draw clipped vertical rectangles */}
        {pattern === 'striped' && !isDead && (
          <g clipPath="url(#clip-body)">
            <rect x="40"  y="0" width="12" height="100" fill={bodyStroke} />
            <rect x="80"  y="0" width="12" height="100" fill={bodyStroke} />
            <rect x="120" y="0" width="12" height="100" fill={bodyStroke} />
            <rect x="160" y="0" width="12" height="100" fill={bodyStroke} />
          </g>
        )}

        {/* 4) If spotted (and not dead), draw clipped circles */}
        {pattern === 'spotted' && !isDead && (
          <g clipPath="url(#clip-body)" fill={bodyStroke}>
            <circle cx="60" cy="30" r="8" />
            <circle cx="100" cy="50" r="6" />
            <circle cx="140" cy="70" r="10" />
            <circle cx="120" cy="30" r="7" />
            <circle cx="80" cy="70" r="5" />
          </g>
        )}

        {/* 5) Tail */}
        <path
          d="
            M20 50
            L0 30
            L0 70
            Z
          "
          fill={tailFill}
          stroke={tailStroke}
          strokeWidth="3"
        />

        {/* 6) Top (dorsal) fin */}
        <path
          d="
            M60 20
            C50 0, 80 10, 90 20
            Z
          "
          fill={finFill}
          stroke={finStroke}
          strokeWidth="2"
        />

        {/* 7) Bottom (pelvic) fin */}
        <path
          d="
            M60 80
            C50 100, 80 90, 90 80
            Z
          "
          fill={finFill}
          stroke={finStroke}
          strokeWidth="2"
        />

        {/* 8) Eye */}
        <circle cx="140" cy="35" r="8" fill={eyeFill} />
        <circle cx="140" cy="35" r="4" fill={isDead ? '#444444' : '#000000'} />

        {/* 9) Red “✕” if dead */}
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
