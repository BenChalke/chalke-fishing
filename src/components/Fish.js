// src/components/Fish.js
import React from 'react';
import './Fish.css';

/**
 * Fish component supporting seven variants:
 *  - orange, blue, striped, green, purple, yellow, spotted
 *  - Each has its own color scheme and minor shape/pattern tweaks.
 *
 * Props:
 *  - x: left position (px)
 *  - y: top position (px)
 *  - size: width (px) (height = size × 0.5)
 *  - onClick: callback when fish is clicked
 *  - isDead: if true, desaturate and overlay cross on eye
 *  - type: one of the seven types
 */
export default function Fish({ x, y, size, onClick, isDead, type }) {
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

  let bodyFill, bodyStroke, tailFill, tailStroke, finFill, finStroke, eyeFill;

  switch (type) {
    case 'blue':
      bodyFill = isDead ? '#556B7D' : '#4A90E2';
      bodyStroke = isDead ? '#3A556A' : '#336FB3';
      tailFill = isDead ? '#3A556A' : '#336FB3';
      tailStroke = isDead ? '#1F2F3C' : '#1E4F7A';
      finFill = isDead ? '#6D8CA5' : '#7FB3E6';
      finStroke = isDead ? '#4D6190' : '#4A7FB3';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'striped':
      bodyFill = isDead ? '#999999' : '#FFD700';
      bodyStroke = isDead ? '#666666' : '#CC8400';
      tailFill = isDead ? '#666666' : '#CC8400';
      tailStroke = isDead ? '#444444' : '#A65200';
      finFill = isDead ? '#AAAAAA' : '#FFB84C';
      finStroke = isDead ? '#777777' : '#CC8400';
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
      bodyFill = isDead ? '#8C7AA5' : '#9B30FF';
      bodyStroke = isDead ? '#6A5E7A' : '#7A1E9A';
      tailFill = isDead ? '#6A5E7A' : '#7A1E9A';
      tailStroke = isDead ? '#4B3A52' : '#561E7A';
      finFill = isDead ? '#A396C1' : '#BE55FF';
      finStroke = isDead ? '#7F6DA2' : '#8C1ECC';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'yellow':
      bodyFill = isDead ? '#A09A4C' : '#FFD700';
      bodyStroke = isDead ? '#87824B' : '#FFC200';
      tailFill = isDead ? '#87824B' : '#FFC200';
      tailStroke = isDead ? '#5F5B32' : '#E09E00';
      finFill = isDead ? '#C0BA6C' : '#FFEB7F';
      finStroke = isDead ? '#9E984D' : '#FFD200';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'spotted':
      bodyFill = isDead ? '#606F6D' : '#20B2AA';
      bodyStroke = isDead ? '#4A5958' : '#1E8C86';
      tailFill = isDead ? '#4A5958' : '#1E8C86';
      tailStroke = isDead ? '#2F3A39' : '#145B57';
      finFill = isDead ? '#728D8C' : '#66CDAA';
      finStroke = isDead ? '#5E7675' : '#4CA694';
      eyeFill = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    default: // "orange"
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
        {/* Main body */}
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

        {/* Tail */}
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

        {/* Dorsal fin */}
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

        {/* Pelvic fin */}
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

        {/* Eye */}
        <circle cx="140" cy="35" r="8" fill={eyeFill} />
        <circle cx="140" cy="35" r="4" fill={isDead ? '#444444' : '#000000'} />

        {/* Red “✕” over eye if dead */}
        {isDead && (
          <g stroke="#FF0000" strokeWidth="3">
            <line x1="136" y1="31" x2="144" y2="39" />
            <line x1="144" y1="31" x2="136" y2="39" />
          </g>
        )}

        {/* Stripes for striped fish (only when alive) */}
        {type === 'striped' && !isDead && (
          <>
            <path d="M50 20 L50 80" stroke="#FF0000" strokeWidth="4" />
            <path d="M80 20 L80 80" stroke="#FF0000" strokeWidth="4" />
            <path d="M110 20 L110 80" stroke="#FF0000" strokeWidth="4" />
          </>
        )}

        {/* Spots for spotted fish (only when alive) */}
        {type === 'spotted' && !isDead && (
          <>
            <circle cx="60" cy="40" r="6" fill="#145B57" />
            <circle cx="90" cy="60" r="8" fill="#145B57" />
            <circle cx="120" cy="35" r="5" fill="#145B57" />
          </>
        )}
      </svg>
    </div>
  );
}
