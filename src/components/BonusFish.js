// src/components/BonusFish.js
import React from 'react';
import './BonusFish.css';

const BONUS_COLORS = {
  frenzy:     { body: '#FF4500', stroke: '#CC2200', tail: '#CC2200', tailStroke: '#881100' },
  timebonus:  { body: '#FFD700', stroke: '#CCA800', tail: '#CCA800', tailStroke: '#886E00' },
  multiplier: { body: '#00CED1', stroke: '#009AA0', tail: '#009AA0', tailStroke: '#006068' },
  slowmo:     { body: '#87CEEB', stroke: '#5BA8CC', tail: '#5BA8CC', tailStroke: '#3A7A99' },
  bad:        { body: '#0d0d0d', stroke: '#CC0000', tail: '#330000', tailStroke: '#220000' },
};

const BONUS_LABELS = {
  frenzy:     'FRENZY',
  timebonus:  '+15s',
  multiplier: 'x2',
  slowmo:     'SLOW',
  bad:        '☠',
};

/**
 * BonusFish: power-up fish rendered during Time Trial.
 * Props:
 *  - id:         unique identifier for SVG clip IDs
 *  - x, y:       position (px)
 *  - type:       'frenzy' | 'timebonus' | 'multiplier' | 'slowmo'
 *  - angle:      movement direction (radians)
 *  - onClick:    called when fish is clicked/tapped
 *  - isMobile:   bind touch instead of click
 *  - isExpiring: show flicker warning (last 2s of lifespan)
 */
export default function BonusFish({ id, x, y, type, angle, onClick, isMobile, isExpiring }) {
  const BONUS_W = 150;
  const BONUS_H = 75;

  const facing = Math.cos(angle) >= 0 ? 1 : -1;
  const c      = BONUS_COLORS[type] || BONUS_COLORS.frenzy;
  const label  = BONUS_LABELS[type] || '?';

  const wrapperStyle = {
    position:        'absolute',
    left:            0,
    top:             0,
    width:           `${BONUS_W}px`,
    height:          `${BONUS_H}px`,
    cursor:          'pointer',
    transform:       `translate3d(${x}px,${y}px,0) scaleX(${facing})`,
    transformOrigin: 'center center',
    zIndex:          10,
  };

  const clipId = `clip-bonus-${id}`;

  // Counter-transform so the label text reads correctly even when fish faces left.
  // When the outer div has scaleX(-1), SVG x maps as: visual_x = 200 - svg_x.
  // Applying "translate(200,0) scale(-1,1)" on the text group cancels this flip
  // while keeping the text centred at the same visual position.
  const textTransform = facing === -1 ? 'translate(200, 0) scale(-1, 1)' : '';

  return (
    <div
      className={`bonus-fish bonus-fish-${type}${isExpiring ? ' bonus-fish-expiring' : ''}`}
      style={wrapperStyle}
      {...(isMobile ? { onTouchEnd: onClick } : { onClick })}
    >
      <svg
        viewBox="0 0 200 100"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d="M24 50 C22 22, 88 2, 150 22 C175 35, 174 65, 150 78 C88 98, 22 78, 24 50 Z" />
          </clipPath>
        </defs>

        {/* ── FORKED TAIL (animated) ── */}
        <g className="fish-tail" style={{ animationDuration: '0.6s' }}>
          <path
            d="M24 50 C14 36, 2 22, 0 12 C4 28, 12 42, 24 50 C12 58, 4 72, 0 88 C2 78, 14 64, 24 50 Z"
            fill={c.tail}
            stroke={c.tailStroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* ── BODY ── */}
        <path
          d="M24 50 C22 22, 88 2, 150 22 C175 35, 174 65, 150 78 C88 98, 22 78, 24 50 Z"
          fill={c.body}
          stroke={c.stroke}
          strokeWidth="3.5"
        />

        {/* ── BELLY SHEEN ── */}
        <ellipse
          cx="100" cy="66"
          rx="52" ry="11"
          fill="rgba(255,255,255,0.15)"
          clipPath={`url(#${clipId})`}
        />

        {/* ── DORSAL FIN ── */}
        <path
          d="M68 18 C58 0, 92 8, 102 18 Z"
          fill={c.stroke}
          stroke={c.tailStroke}
          strokeWidth="2"
        />

        {/* ── PELVIC FIN ── */}
        <path
          d="M68 82 C58 100, 92 92, 102 82 Z"
          fill={c.stroke}
          stroke={c.tailStroke}
          strokeWidth="2"
        />

        {/* ── LABEL (counter-transformed when facing left) ── */}
        <g transform={textTransform}>
          <text
            x="95"
            y="55"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#FFFFFF"
            stroke="rgba(0,0,0,0.65)"
            strokeWidth="2"
            paintOrder="stroke"
            fontFamily="'Arial Black', Arial, sans-serif"
          >
            {label}
          </text>
        </g>

        {/* ── LAYERED EYE ── */}
        <circle cx="154" cy="34" r="9"   fill="#FFFFFF" />
        <circle cx="154" cy="34" r="6"   fill="#1a3a5c" />
        <circle cx="154" cy="34" r="3.5" fill="#000000" />
        <circle cx="157" cy="31" r="1.6" fill="#FFFFFF" opacity="0.9" />
      </svg>
    </div>
  );
}
