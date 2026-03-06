// src/components/Fish.js
import React from 'react';
import './Fish.css';
import { SUPER_COLOURS, RARE_COLOURS } from "../constants/fishConstants";

/**
 * Fish component with separate colour + pattern.
 *
 * Props:
 *  - id:        unique identifier (used to generate unique SVG IDs)
 *  - x:         left (px)
 *  - y:         top (px)
 *  - size:      width in px (height = size × 0.5)
 *  - onClick:   callback when fish is clicked
 *  - isDead:    boolean; if true, overlay a red "✕" on the eye
 *  - colour:    fish colour string
 *  - pattern:   one of 'solid','striped','spotted'
 *  - isMobile:  boolean; if true, bind touch instead of click
 *  - angle:     number (radians) indicating movement direction
 *  - speed:     number (global speed) used to set tail‐wag frequency
 */
export default function Fish({
  id,
  x,
  y,
  size,
  onClick,
  isDead = false,
  colour,
  pattern,
  isMobile,
  angle = 0,
  speed = 1.5,
}) {
  const fishWidth  = size;
  const fishHeight = size * 0.5;

  // Flip horizontally depending on movement direction
  const facing = Math.cos(angle) >= 0 ? 1 : -1;

  // Tail-wag duration: inverse to speed (minimum 0.2s)
  const tailDuration = Math.max(0.2, 1.5 / speed);

  // Outer div handles position only (with CSS transition for smooth interpolation).
  // Inner div handles the flip instantly so direction changes never animate.
  const outerStyle = {
    position:   'absolute',
    left:       0,
    top:        0,
    width:      `${fishWidth}px`,
    height:     `${fishHeight}px`,
    cursor:     'none',
    transform:  `translate3d(${x}px,${y}px,0)`,
    transition: 'transform 30ms linear',
  };
  const innerStyle = {
    width:           '100%',
    height:          '100%',
    transform:       `scaleX(${facing})`,
    transformOrigin: 'center center',
  };

  // Determine extra CSS class based on rarity
  let rarityClass = '';
  if (SUPER_COLOURS.includes(colour)) {
    rarityClass = 'super-fish';
  } else if (RARE_COLOURS.includes(colour)) {
    rarityClass = 'rare-fish';
  }

  // Determine fill/stroke based on colour & isDead
  let bodyFill,
      bodyStroke,
      tailFill,
      tailStroke,
      finFill,
      finStroke,
      eyeFill;

  switch (colour) {
    case 'blue':
      bodyFill   = isDead ? '#556B7D' : '#4A90E2';
      bodyStroke = isDead ? '#3A556A' : '#336FB3';
      tailFill   = isDead ? '#3A556A' : '#336FB3';
      tailStroke = isDead ? '#1F2F3C' : '#1E4F7A';
      finFill    = isDead ? '#6D8CA5' : '#7FB3E6';
      finStroke  = isDead ? '#4D6190' : '#4A7FB3';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'green':
      bodyFill   = isDead ? '#667B6F' : '#3CB371';
      bodyStroke = isDead ? '#4D6053' : '#29875A';
      tailFill   = isDead ? '#4D6053' : '#29875A';
      tailStroke = isDead ? '#2F3B32' : '#1F533A';
      finFill    = isDead ? '#7FAE97' : '#7CFC00';
      finStroke  = isDead ? '#5F8067' : '#5EB700';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'purple':
      bodyFill   = isDead ? '#766D87' : '#8A2BE2';
      bodyStroke = isDead ? '#5A5870' : '#6529C7';
      tailFill   = isDead ? '#5A5870' : '#6529C7';
      tailStroke = isDead ? '#3C3B4C' : '#321995';
      finFill    = isDead ? '#9B94A8' : '#B266E6';
      finStroke  = isDead ? '#7D7190' : '#8033C2';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'yellow':
      bodyFill   = isDead ? '#A69A56' : '#FFD700';
      bodyStroke = isDead ? '#7F763F' : '#E6B800';
      tailFill   = isDead ? '#7F763F' : '#E6B800';
      tailStroke = isDead ? '#605C2C' : '#B38C00';
      finFill    = isDead ? '#BFB56C' : '#FFEA5C';
      finStroke  = isDead ? '#9C964A' : '#C7B047';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'spotted':
      bodyFill   = isDead ? '#5B7A7A' : '#20B2AA';
      bodyStroke = isDead ? '#3F5555' : '#1F8F85';
      tailFill   = isDead ? '#3F5555' : '#1F8F85';
      tailStroke = isDead ? '#2A3A3A' : '#14514D';
      finFill    = isDead ? '#79A5A5' : '#40C2B6';
      finStroke  = isDead ? '#617A7A' : '#329990';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'red':
      bodyFill   = isDead ? '#8B0000' : 'url(#red-gradient)';
      bodyStroke = isDead ? '#5A0000' : '#FF0000';
      tailFill   = isDead ? '#5A0000' : '#FF2020';
      tailStroke = isDead ? '#3C0000' : '#CC1010';
      finFill    = isDead ? '#A00000' : '#FF4040';
      finStroke  = isDead ? '#770000' : '#CC3030';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'pink':
      bodyFill   = isDead ? '#B07080' : '#FF69B4';
      bodyStroke = isDead ? '#803050' : '#FF1493';
      tailFill   = isDead ? '#803050' : '#FF1493';
      tailStroke = isDead ? '#502030' : '#C71585';
      finFill    = isDead ? '#D08098' : '#FFB6C1';
      finStroke  = isDead ? '#A06078' : '#FF82AB';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'silver':
      bodyFill   = isDead ? '#808080' : '#C0C0C0';
      bodyStroke = isDead ? '#606060' : '#A9A9A9';
      tailFill   = isDead ? '#606060' : '#A9A9A9';
      tailStroke = isDead ? '#404040' : '#808080';
      finFill    = isDead ? '#909090' : '#E0E0E0';
      finStroke  = isDead ? '#707070' : '#B0B0B0';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'crimson':
      bodyFill   = isDead ? '#5C0008' : 'url(#crimson-gradient)';
      bodyStroke = isDead ? '#3F0005' : '#DC143C';
      tailFill   = isDead ? '#3F0005' : '#E00040';
      tailStroke = isDead ? '#260003' : '#B01230';
      finFill    = isDead ? '#7F1A27' : '#FF416C';
      finStroke  = isDead ? '#601423' : '#D03258';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'cyan':
      bodyFill   = isDead ? '#02666B' : 'url(#cyan-gradient)';
      bodyStroke = isDead ? '#014344' : '#00CED1';
      tailFill   = isDead ? '#014344' : '#20E0E6';
      tailStroke = isDead ? '#012826' : '#06A0A4';
      finFill    = isDead ? '#037F8C' : '#66FFFF';
      finStroke  = isDead ? '#026666' : '#33E0E0';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'emerald':
      bodyFill   = isDead ? '#2F4F2F' : 'url(#emerald-gradient)';
      bodyStroke = isDead ? '#233B23' : '#388E3C';
      tailFill   = isDead ? '#233B23' : '#388E3C';
      tailStroke = isDead ? '#1F2C1A' : '#2D5A2E';
      finFill    = isDead ? '#6FAE97' : '#76EE00';
      finStroke  = isDead ? '#5A9A75' : '#2E8B57';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'sunset':
      bodyFill   = isDead ? '#7f4e3f' : '#FF4500';
      bodyStroke = isDead ? '#5c3931' : '#E64A19';
      tailFill   = isDead ? '#5c3931' : '#D84315';
      tailStroke = isDead ? '#3e2821' : '#BF360C';
      finFill    = isDead ? '#a06757' : '#FF8C00';
      finStroke  = isDead ? '#855040' : '#F57C00';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'neon':
      bodyFill   = isDead ? '#354300' : 'url(#neon-gradient)';
      bodyStroke = isDead ? '#2a3600' : '#39FF14';
      tailFill   = isDead ? '#2a3600' : '#32CD32';
      tailStroke = isDead ? '#1f2500' : '#28A428';
      finFill    = isDead ? '#456100' : '#7CFC00';
      finStroke  = isDead ? '#345000' : '#32CD32';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'golden':
      bodyFill   = isDead ? '#8B7D46' : 'url(#gold-gradient)';
      bodyStroke = isDead ? '#6A5E2D' : '#B8860B';
      tailFill   = isDead ? '#6A5E2D' : '#B8860B';
      tailStroke = isDead ? '#4E421F' : '#8B6508';
      finFill    = isDead ? '#A29050' : '#FFD700';
      finStroke  = isDead ? '#7B6B34' : '#DAA520';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'aqua':
      bodyFill   = isDead ? '#4A6A6A' : '#00FFFF';
      bodyStroke = isDead ? '#2A4D4D' : '#00EEEE';
      tailFill   = isDead ? '#2A4D4D' : '#00CDCD';
      tailStroke = isDead ? '#1A2D2D' : '#009999';
      finFill    = isDead ? '#6AA8A8' : '#7FFFD4';
      finStroke  = isDead ? '#4D9191' : '#40E0D0';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'lavender':
      bodyFill   = isDead ? '#6A5A7A' : '#E6E6FA';
      bodyStroke = isDead ? '#4C405B' : '#D8BFD8';
      tailFill   = isDead ? '#4C405B' : '#D8BFD8';
      tailStroke = isDead ? '#2E283D' : '#B57FB5';
      finFill    = isDead ? '#9C8CA5' : '#EE82EE';
      finStroke  = isDead ? '#7B6880' : '#DA70D6';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'coral':
      bodyFill   = isDead ? '#8A7060' : '#FF7F50';
      bodyStroke = isDead ? '#6F5543' : '#FF6347';
      tailFill   = isDead ? '#6F5543' : '#FF4500';
      tailStroke = isDead ? '#4F3A31' : '#E63900';
      finFill    = isDead ? '#AF8C80' : '#FFA07A';
      finStroke  = isDead ? '#8C6A60' : '#FF8266';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'aurora':
      bodyFill   = isDead ? '#3A3A3A' : 'url(#aurora-gradient)';
      bodyStroke = isDead ? '#282828' : '#00FFFF';
      tailFill   = isDead ? '#282828' : '#00CED1';
      tailStroke = isDead ? '#1A1A1A' : '#008B8B';
      finFill    = isDead ? '#505050' : '#7FFFD4';
      finStroke  = isDead ? '#404040' : '#20B2AA';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'midnight':
      bodyFill   = isDead ? '#222233' : '#191970';
      bodyStroke = isDead ? '#181824' : '#000080';
      tailFill   = isDead ? '#181824' : '#00008B';
      tailStroke = isDead ? '#0F0F16' : '#00004B';
      finFill    = isDead ? '#363648' : '#4169E1';
      finStroke  = isDead ? '#2C2C3C' : '#27408B';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'obsidian':
      bodyFill   = isDead ? '#2E2E2E' : 'url(#obsidian-gradient)';
      bodyStroke = isDead ? '#1F1F1F' : '#0D0D0D';
      tailFill   = isDead ? '#1F1F1F' : '#1A1A1A';
      tailStroke = isDead ? '#0F0F0F' : '#0A0A0A';
      finFill    = isDead ? '#444444' : '#696969';
      finStroke  = isDead ? '#303030' : '#505050';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'galactic':
      bodyFill   = isDead ? '#1A1A2E' : '#483D8B';
      bodyStroke = isDead ? '#10101A' : '#2F4F4F';
      tailFill   = isDead ? '#10101A' : '#3A5F5F';
      tailStroke = isDead ? '#0A0A10' : '#1F3F3F';
      finFill    = isDead ? '#2E2E4A' : '#7B68EE';
      finStroke  = isDead ? '#24243D' : '#553CB5';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'phantom':
      bodyFill   = isDead ? '#2A1A2A' : '#800080';
      bodyStroke = isDead ? '#1A101A' : '#4B0082';
      tailFill   = isDead ? '#1A101A' : '#6A0DAD';
      tailStroke = isDead ? '#0D080D' : '#4D0080';
      finFill    = isDead ? '#442A44' : '#BA55D3';
      finStroke  = isDead ? '#332033' : '#9932CC';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'rainbow':
      bodyFill   = isDead ? '#4A4A4A' : 'url(#rainbow-gradient)';
      bodyStroke = isDead ? '#2A2A2A' : '#FF00FF';
      tailFill   = isDead ? '#2A2A2A' : '#9400D3';
      tailStroke = isDead ? '#1A1A1A' : '#4B0082';
      finFill    = isDead ? '#5A5A5A' : '#8A2BE2';
      finStroke  = isDead ? '#3A3A3A' : '#551A8B';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    case 'volcano':
      bodyFill   = isDead ? '#502B1E' : '#D72600';
      bodyStroke = isDead ? '#382115' : '#FF4500';
      tailFill   = isDead ? '#382115' : '#FF6347';
      tailStroke = isDead ? '#20120D' : '#CD3700';
      finFill    = isDead ? '#6A3D2E' : '#FF7F50';
      finStroke  = isDead ? '#51302A' : '#FF4500';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;

    default: // 'orange'
      bodyFill   = isDead ? '#777777' : '#FFA500';
      bodyStroke = isDead ? '#555555' : '#FF8C00';
      tailFill   = isDead ? '#555555' : '#E07000';
      tailStroke = isDead ? '#333333' : '#CC5500';
      finFill    = isDead ? '#888888' : '#FFD27F';
      finStroke  = isDead ? '#666666' : '#FFB347';
      eyeFill    = isDead ? '#CCCCCC' : '#FFFFFF';
      break;
  }

  // Unique IDs per fish instance
  const clipId    = `clip-body-${id}`;
  const scalePatId = `scale-pat-${id}`;

  return (
    <div
      style={outerStyle}
      onPointerDown={onClick}
    >
    <div className={rarityClass} style={innerStyle}>
      <svg
        className="fish-svg"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        {/* ── DEFS: gradients, clipPath, scale pattern ── */}
        <defs>
          {/* Colour gradients */}
          {colour === 'emerald' && !isDead && (
            <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#004d00" />
              <stop offset="50%"  stopColor="#00cc00" />
              <stop offset="100%" stopColor="#99ff99" />
            </linearGradient>
          )}
          {colour === 'golden' && !isDead && (
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FFD700" />
              <stop offset="50%"  stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
          )}
          {colour === 'red' && !isDead && (
            <linearGradient id="red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FF8080" />
              <stop offset="50%"  stopColor="#FF0000" />
              <stop offset="100%" stopColor="#CC0000" />
            </linearGradient>
          )}
          {colour === 'crimson' && !isDead && (
            <linearGradient id="crimson-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FF4F69" />
              <stop offset="50%"  stopColor="#DC143C" />
              <stop offset="100%" stopColor="#A1122A" />
            </linearGradient>
          )}
          {colour === 'cyan' && !isDead && (
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#80FFFF" />
              <stop offset="50%"  stopColor="#00CED1" />
              <stop offset="100%" stopColor="#008C8F" />
            </linearGradient>
          )}
          {colour === 'neon' && !isDead && (
            <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#39FF14" />
              <stop offset="50%"  stopColor="#00FF00" />
              <stop offset="100%" stopColor="#32CD32" />
            </linearGradient>
          )}
          {colour === 'aurora' && !isDead && (
            <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#8A2BE2" />
              <stop offset="50%"  stopColor="#00FFFF" />
              <stop offset="100%" stopColor="#4B0082" />
            </linearGradient>
          )}
          {colour === 'obsidian' && !isDead && (
            <linearGradient id="obsidian-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#4B4B4B" />
              <stop offset="50%"  stopColor="#1C1C1C" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          )}
          {colour === 'rainbow' && !isDead && (
            <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#FF0000" />
              <stop offset="20%"  stopColor="#FF7F00" />
              <stop offset="40%"  stopColor="#FFFF00" />
              <stop offset="60%"  stopColor="#00FF00" />
              <stop offset="80%"  stopColor="#0000FF" />
              <stop offset="100%" stopColor="#8B00FF" />
            </linearGradient>
          )}

          {/* Metallic hook gradient (also used for fish fin highlights on some) */}

          {/* Body clip path (new rounder head, tapered tail) */}
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d="
              M24 50
              C22 22, 88 2, 150 22
              C175 35, 174 65, 150 78
              C88 98, 22 78, 24 50
              Z
            " />
          </clipPath>

          {/* Subtle arc-scale texture pattern */}
          <pattern id={scalePatId} x="0" y="0" width="22" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 8 C5 0, 17 0, 22 8"   fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
            <path d="M-11 16 C-6 8, 6 8, 11 16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* ── FORKED TAIL (animated) ── */}
        <g
          className={`fish-tail ${isDead ? 'dead' : ''}`}
          style={{ animationDuration: `${tailDuration}s` }}
        >
          <path
            d="
              M24 50
              C14 36, 2 22, 0 12
              C4 28, 12 42, 24 50
              C12 58, 4 72, 0 88
              C2 78, 14 64, 24 50
              Z
            "
            fill={tailFill}
            stroke={tailStroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* ── BODY ── */}
        <path
          d="
            M24 50
            C22 22, 88 2, 150 22
            C175 35, 174 65, 150 78
            C88 98, 22 78, 24 50
            Z
          "
          fill={bodyFill}
          stroke={bodyStroke}
          strokeWidth="3.5"
        />

        {/* ── STRIPE pattern (clipped to body) ── */}
        {pattern === 'striped' && !isDead && (
          <g clipPath={`url(#${clipId})`}>
            <rect x="45"  y="0" width="13" height="100" fill={bodyStroke} opacity="0.55" />
            <rect x="82"  y="0" width="13" height="100" fill={bodyStroke} opacity="0.55" />
            <rect x="119" y="0" width="13" height="100" fill={bodyStroke} opacity="0.55" />
          </g>
        )}

        {/* ── SPOT pattern (clipped to body) ── */}
        {pattern === 'spotted' && !isDead && (
          <g clipPath={`url(#${clipId})`} fill={bodyStroke} opacity="0.6">
            <circle cx="62"  cy="32" r="8" />
            <circle cx="98"  cy="52" r="6" />
            <circle cx="136" cy="68" r="9" />
            <circle cx="118" cy="28" r="7" />
            <circle cx="78"  cy="70" r="5" />
          </g>
        )}

        {/* ── SCALE TEXTURE (clipped, very subtle) ── */}
        {!isDead && (
          <rect
            x="24" y="0" width="150" height="100"
            fill={`url(#${scalePatId})`}
            clipPath={`url(#${clipId})`}
            opacity="0.10"
          />
        )}

        {/* ── BELLY SHEEN (3D roundness) ── */}
        {!isDead && (
          <ellipse
            cx="100" cy="66"
            rx="52" ry="11"
            fill="rgba(255,255,255,0.09)"
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* ── DORSAL FIN (top) ── */}
        <path
          d="M68 18 C58 0, 92 8, 102 18 Z"
          fill={finFill}
          stroke={finStroke}
          strokeWidth="2"
        />

        {/* ── PELVIC FIN (bottom) ── */}
        <path
          d="M68 82 C58 100, 92 92, 102 82 Z"
          fill={finFill}
          stroke={finStroke}
          strokeWidth="2"
        />

        {/* ── PECTORAL FIN (side, for 3D depth) ── */}
        <path
          d="M112 56 C100 70, 94 80, 104 76 C114 72, 120 62, 112 56 Z"
          fill={finFill}
          stroke={finStroke}
          strokeWidth="1.5"
          opacity="0.82"
        />

        {/* ── GILL SLIT ── */}
        {!isDead && (
          <path
            d="M130 26 C125 40, 125 60, 130 74"
            fill="none"
            stroke={bodyStroke}
            strokeWidth="2"
            opacity="0.45"
          />
        )}

        {/* ── LAYERED EYE ── */}
        {/* Sclera */}
        <circle cx="154" cy="34" r="9"   fill={eyeFill} />
        {/* Iris */}
        <circle cx="154" cy="34" r="6"   fill={isDead ? '#555555' : '#1a3a5c'} />
        {/* Pupil */}
        <circle cx="154" cy="34" r="3.5" fill={isDead ? '#333333' : '#000000'} />
        {/* Highlight (alive only) */}
        {!isDead && (
          <circle cx="157" cy="31" r="1.6" fill="#ffffff" opacity="0.9" />
        )}

        {/* ── DEAD "✕" ── */}
        {isDead && (
          <g className="fish-dead-overlay" stroke="#FF0000" strokeWidth="3" strokeLinecap="round">
            <line x1="149" y1="29" x2="159" y2="39" />
            <line x1="159" y1="29" x2="149" y2="39" />
          </g>
        )}

        {/* ── SPECIAL EFFECTS per colour (animated) ── */}

        {/* Red: bright sparkles */}
        {colour === 'red' && !isDead && (
          <g>
            <circle cx="80"  cy="30" r="4" fill="#FFFFFF" opacity="0.8" />
            <circle cx="120" cy="60" r="3" fill="#FFFFFF" opacity="0.6" />
            <circle cx="100" cy="40" r="2" fill="#FFFFFF" opacity="0.7" />
          </g>
        )}

        {/* Crimson: sparkles */}
        {colour === 'crimson' && !isDead && (
          <g>
            <circle cx="75"  cy="25" r="5" fill="#FFECEC" opacity="0.9" />
            <circle cx="115" cy="65" r="4" fill="#FFDADA" opacity="0.7" />
          </g>
        )}

        {/* Cyan: glint */}
        {colour === 'cyan' && !isDead && (
          <g>
            <circle cx="70"  cy="30" r="5" fill="#E0FFFF" opacity="0.8" />
            <circle cx="130" cy="50" r="4" fill="#B0FFFF" opacity="0.6" />
          </g>
        )}

        {/* Neon: animated electric glow lines */}
        {colour === 'neon' && !isDead && (
          <g stroke="#39FF14" strokeWidth="2" fill="none" className="neon-glow">
            <polyline points="52,10 72,50 52,90" />
            <polyline points="92,10 112,50 92,90" />
          </g>
        )}

        {/* Aurora: animated wavy arcs */}
        {colour === 'aurora' && !isDead && (
          <g>
            <path
              className="aurora-wave"
              d="M32 38 C60 12, 120 12, 165 38"
              stroke="#00FFFF" strokeWidth="2.5" fill="none"
            />
            <path
              className="aurora-wave aurora-wave-2"
              d="M32 62 C60 88, 120 88, 165 62"
              stroke="#8A2BE2" strokeWidth="2.5" fill="none"
            />
          </g>
        )}

        {/* Midnight: animated twinkling star dots */}
        {colour === 'midnight' && !isDead && (
          <g className="midnight-stars" fill="#FFFFFF">
            <circle cx="58"  cy="22" r="2"   style={{ animationDelay: '0s'   }} />
            <circle cx="82"  cy="42" r="1.5" style={{ animationDelay: '0.3s' }} />
            <circle cx="118" cy="28" r="2"   style={{ animationDelay: '0.7s' }} />
            <circle cx="100" cy="64" r="1.5" style={{ animationDelay: '0.5s' }} />
            <circle cx="52"  cy="56" r="1"   style={{ animationDelay: '0.2s' }} />
            <circle cx="138" cy="72" r="1.5" style={{ animationDelay: '0.9s' }} />
          </g>
        )}

        {/* Obsidian: subtle lava-crack lines */}
        {colour === 'obsidian' && !isDead && (
          <g stroke="#606060" strokeWidth="1" opacity="0.6">
            <path d="M52 30 L72 50 L52 70" fill="none" />
            <path d="M84 20 L104 40 L84 60" fill="none" />
          </g>
        )}

        {/* Galactic: animated cosmic star dots */}
        {colour === 'galactic' && !isDead && (
          <g>
            <circle cx="58"  cy="50" r="3" fill="#FFFFFF" className="galactic-star" style={{ animationDelay: '0s'   }} />
            <circle cx="98"  cy="28" r="5" fill="#FFD700" className="galactic-star" style={{ animationDelay: '0.5s' }} />
            <circle cx="132" cy="64" r="3" fill="#FFFFFF" className="galactic-star" style={{ animationDelay: '1.0s' }} />
            <circle cx="78"  cy="68" r="2" fill="#E0E0FF" className="galactic-star" style={{ animationDelay: '0.3s' }} />
          </g>
        )}

        {/* Phantom: ghostly mist trails */}
        {colour === 'phantom' && !isDead && (
          <g stroke="#CCCCCC" strokeWidth="1.5" opacity="0.5" fill="none">
            <path d="M32 60 C55 82, 90 82, 110 60" />
            <path d="M52 38 C75 58, 112 58, 132 38" />
          </g>
        )}

        {/* Rainbow: animated shimmer overlay */}
        {colour === 'rainbow' && !isDead && (
          <rect
            x="24" y="0" width="150" height="100"
            fill="url(#rainbow-gradient)"
            clipPath={`url(#${clipId})`}
            className="rainbow-shimmer"
          />
        )}

        {/* Volcano: molten glow dots */}
        {colour === 'volcano' && !isDead && (
          <g>
            <circle cx="52"  cy="50" r="4" fill="#FF4500" opacity="0.7" />
            <circle cx="148" cy="50" r="3" fill="#FFD700" opacity="0.6" />
          </g>
        )}

        {/* Golden: metallic glint */}
        {colour === 'golden' && !isDead && (
          <g>
            <circle cx="100" cy="40" r="5" fill="#FFFACD" opacity="0.8" />
            <circle cx="140" cy="62" r="3" fill="#FFEFD5" opacity="0.6" />
          </g>
        )}

        {/* Aqua: bubble trail */}
        {colour === 'aqua' && !isDead && (
          <g fill="#E0FFFF" opacity="0.6">
            <circle cx="42" cy="50" r="3" />
            <circle cx="32" cy="60" r="2" />
            <circle cx="22" cy="70" r="2" />
          </g>
        )}

        {/* Lavender: floral swirl */}
        {colour === 'lavender' && !isDead && (
          <g stroke="#D8BFD8" strokeWidth="1.5" opacity="0.7" fill="none">
            <path d="M62 28 C74 18, 104 18, 116 28" />
            <path d="M62 72 C74 82, 104 82, 116 72" />
          </g>
        )}

        {/* Coral: coral-branch motif */}
        {colour === 'coral' && !isDead && (
          <g stroke="#FF7F50" strokeWidth="1.5" opacity="0.7" fill="none">
            <path d="M82 28 L92 40 L82 52" />
            <path d="M102 60 L112 72 L102 82" />
          </g>
        )}
      </svg>
    </div>
    </div>
  );
}
