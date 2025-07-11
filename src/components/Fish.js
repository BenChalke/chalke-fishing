// src/components/Fish.js
import React from 'react';
import './Fish.css';
import { SUPER_COLOURS, RARE_COLOURS } from "../constants/fishConstants";

/**
 * Fish component with separate colour + pattern.
 *
 * Props:
 *  - id:        unique identifier (used to generate a unique clipPath)
 *  - x:         left (px)
 *  - y:         top (px)
 *  - size:      width in px (height = size × 0.5)
 *  - onClick:   callback when fish is clicked
 *  - isDead:    boolean; if true, overlay a red “✕” on the eye
 *  - colour:    e.g. 'orange','blue','green','purple','yellow',
 *               'red','pink','silver','crimson','cyan',
 *               'emerald','sunset','neon','aurora','midnight','obsidian',
 *               'galactic','phantom','rainbow','volcano','golden','aqua','lavender','coral'
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

  const wrapperStyle = {
    position: 'absolute',
    left:   `${x}px`,
    top:    `${y}px`,
    width:  `${fishWidth}px`,
    height: `${fishHeight}px`,
    cursor: 'none',
    transform: `scaleX(${facing})`,
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
      /* Teal base for spotted fish */
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

  // Unique clipPath ID per fish instance
  const clipId = `clip-body-${id}`;

  return (
    <div
      className={rarityClass}
      style={wrapperStyle}
      {...(isMobile ? { onTouchEnd: onClick } : { onClick: onClick })}
    >
      <svg
        className="fish-svg"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        {/* 1) Emerald gradient for 'emerald' */}
        {colour === 'emerald' && !isDead && (
          <defs>
            <linearGradient
              id="emerald-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#004d00" />
              <stop offset="50%" stopColor="#00cc00" />
              <stop offset="100%" stopColor="#99ff99" />
            </linearGradient>
          </defs>
        )}

        {/* 2) Gold gradient for 'golden' */}
        {colour === 'golden' && !isDead && (
          <defs>
            <linearGradient
              id="gold-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
          </defs>
        )}

        {/* 3) Red gradient for 'red' fish */}
        {colour === 'red' && !isDead && (
          <defs>
            <linearGradient id="red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8080" />
              <stop offset="50%" stopColor="#FF0000" />
              <stop offset="100%" stopColor="#CC0000" />
            </linearGradient>
          </defs>
        )}

        {/* 4) Crimson gradient for 'crimson' fish */}
        {colour === 'crimson' && !isDead && (
          <defs>
            <linearGradient
              id="crimson-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FF4F69" />
              <stop offset="50%" stopColor="#DC143C" />
              <stop offset="100%" stopColor="#A1122A" />
            </linearGradient>
          </defs>
        )}

        {/* 5) Cyan gradient for 'cyan' fish */}
        {colour === 'cyan' && !isDead && (
          <defs>
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#80FFFF" />
              <stop offset="50%" stopColor="#00CED1" />
              <stop offset="100%" stopColor="#008C8F" />
            </linearGradient>
          </defs>
        )}

        {/* 6) Neon gradient for 'neon' fish */}
        {colour === 'neon' && !isDead && (
          <defs>
            <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#39FF14" />
              <stop offset="50%" stopColor="#00FF00" />
              <stop offset="100%" stopColor="#32CD32" />
            </linearGradient>
          </defs>
        )}

        {/* 7) Aurora gradient for 'aurora' fish */}
        {colour === 'aurora' && !isDead && (
          <defs>
            <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8A2BE2" />
              <stop offset="50%" stopColor="#00FFFF" />
              <stop offset="100%" stopColor="#4B0082" />
            </linearGradient>
          </defs>
        )}

        {/* 8) Obsidian gradient for 'obsidian' fish */}
        {colour === 'obsidian' && !isDead && (
          <defs>
            <linearGradient id="obsidian-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4B4B4B" />
              <stop offset="50%" stopColor="#1C1C1C" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
        )}

        {/* 9) Rainbow gradient for 'rainbow' fish */}
        {colour === 'rainbow' && !isDead && (
          <defs>
            <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF0000" />   {/* red */}
              <stop offset="20%" stopColor="#FF7F00" />  {/* orange */}
              <stop offset="40%" stopColor="#FFFF00" />  {/* yellow */}
              <stop offset="60%" stopColor="#00FF00" />  {/* green */}
              <stop offset="80%" stopColor="#0000FF" />  {/* blue */}
              <stop offset="100%" stopColor="#8B00FF" /> {/* purple */}
            </linearGradient>
          </defs>
        )}

        {/* 10) ClipPath for fish body (for stripes/spots) */}
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
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

        {/* 11) Fish body */}
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

        {/* 12) Stripes (if striped & alive), clipped by unique clipPath */}
        {pattern === 'striped' && !isDead && (
          <g clipPath={`url(#${clipId})`}>
            <rect x="40"  y="0"  width="12" height="100" fill={bodyStroke} />
            <rect x="80"  y="0"  width="12" height="100" fill={bodyStroke} />
            <rect x="120" y="0"  width="12" height="100" fill={bodyStroke} />
            <rect x="160" y="0"  width="12" height="100" fill={bodyStroke} />
          </g>
        )}

        {/* 13) Spots (if spotted & alive), clipped by unique clipPath */}
        {pattern === 'spotted' && !isDead && (
          <g clipPath={`url(#${clipId})`} fill={bodyStroke}>
            <circle cx="60"  cy="30"  r="8" />
            <circle cx="100" cy="50"  r="6" />
            <circle cx="140" cy="70"  r="10" />
            <circle cx="120" cy="30"  r="7" />
            <circle cx="80"  cy="70"  r="5" />
          </g>
        )}

        {/* 14) Tail (wrapped in <g> for animation) */}
        <g
          className={`fish-tail ${isDead ? 'dead' : ''}`}
          style={{ animationDuration: `${tailDuration}s` }}
        >
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
        </g>

        {/* 15) Top (dorsal) fin */}
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

        {/* 16) Bottom (pelvic) fin */}
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

        {/* 17) Eye */}
        <circle cx="140" cy="35" r="8" fill={eyeFill} />
        <circle
          cx="140"
          cy="35"
          r="4"
          fill={isDead ? '#444444' : '#000000'}
        />

        {/* 18) Red “✕” if dead */}
        {isDead && (
          <g className="fish-dead-overlay" stroke="#FF0000" strokeWidth="3">
            <line x1="136" y1="31" x2="144" y2="39" />
            <line x1="144" y1="31" x2="136" y2="39" />
          </g>
        )}

        {/* 19) Sparkles on red fish */}
        {colour === 'red' && !isDead && (
          <g>
            <circle cx="80"  cy="30" r="4" fill="#FFFFFF" opacity="0.8" />
            <circle cx="120" cy="60" r="3" fill="#FFFFFF" opacity="0.6" />
            <circle cx="100" cy="40" r="2" fill="#FFFFFF" opacity="0.7" />
          </g>
        )}

        {/* 20) Sparkles on crimson fish */}
        {colour === 'crimson' && !isDead && (
          <g>
            <circle cx="75"  cy="25" r="5" fill="#FFECEC" opacity="0.9" />
            <circle cx="115" cy="65" r="4" fill="#FFDADA" opacity="0.7" />
          </g>
        )}

        {/* 21) Sparkles on cyan fish */}
        {colour === 'cyan' && !isDead && (
          <g>
            <circle cx="70"  cy="30" r="5"  fill="#E0FFFF" opacity="0.8" />
            <circle cx="130" cy="50" r="4"  fill="#B0FFFF" opacity="0.6" />
          </g>
        )}

        {/* 22) Neon fish: electric glow lines */}
        {colour === 'neon' && !isDead && (
          <g stroke="#39FF14" strokeWidth="2" opacity="0.7">
            <polyline points="50,10 70,50 50,90" fill="none" />
            <polyline points="90,10 110,50 90,90" fill="none" />
          </g>
        )}

        {/* 23) Aurora fish: swirling aurora arcs */}
        {colour === 'aurora' && !isDead && (
          <g>
            <path
              d="M30 40 C50 10, 150 10, 170 40"
              stroke="#00FFFF"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M30 60 C50 90, 150 90, 170 60"
              stroke="#4B0082"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
          </g>
        )}

        {/* 24) Midnight fish: faint star dots */}
        {colour === 'midnight' && !isDead && (
          <g fill="#FFFFFF" opacity="0.8">
            <circle cx="60"  cy="20" r="2" />
            <circle cx="80"  cy="40" r="1.5" />
            <circle cx="120" cy="30" r="2" />
            <circle cx="140" cy="60" r="1.5" />
          </g>
        )}

        {/* 25) Obsidian fish: subtle “lava-crack” lines */}
        {colour === 'obsidian' && !isDead && (
          <g stroke="#505050" strokeWidth="1" opacity="0.6">
            <path d="M50 30 L70 50 L50 70" fill="none" />
            <path d="M80 20 L100 40 L80 60" fill="none" />
          </g>
        )}

        {/* 26) Galactic fish: cosmic starburst accents */}
        {colour === 'galactic' && !isDead && (
          <g>
            <circle cx="60"  cy="50" r="3" fill="#FFFFFF" opacity="0.7" />
            <circle cx="100" cy="30" r="5" fill="#FFD700" opacity="0.6" />
            <circle cx="140" cy="60" r="3" fill="#FFFFFF" opacity="0.7" />
          </g>
        )}

        {/* 27) Phantom fish: ghostly mist trails */}
        {colour === 'phantom' && !isDead && (
          <g stroke="#CCCCCC" strokeWidth="1" opacity="0.5">
            <path d="M30 60 C50 80, 80 80, 100 60" fill="none" />
            <path d="M50 40 C70 60, 110 60, 130 40" fill="none" />
          </g>
        )}

        {/* 28) Rainbow fish: prism sparkles */}
        {colour === 'rainbow' && !isDead && (
          <g>
            <circle cx="80"  cy="20" r="4" fill="#FFFFFF" opacity="0.8" />
            <circle cx="120" cy="70" r="3" fill="#FFFF00" opacity="0.7" />
            <circle cx="100" cy="45" r="2" fill="#FF00FF" opacity="0.6" />
          </g>
        )}

        {/* 29) Volcano fish: molten lava flicker */}
        {colour === 'volcano' && !isDead && (
          <g>
            <circle cx="50"  cy="50" r="4" fill="#FF4500" opacity="0.7" />
            <circle cx="150" cy="50" r="3" fill="#FFD700" opacity="0.6" />
          </g>
        )}

        {/* 30) Golden fish: metallic glint */}
        {colour === 'golden' && !isDead && (
          <g>
            <circle cx="100" cy="40" r="5" fill="#FFFACD" opacity="0.8" />
            <circle cx="140" cy="60" r="3" fill="#FFEFD5" opacity="0.6" />
          </g>
        )}

        {/* 31) Aqua fish: bubble trail */}
        {colour === 'aqua' && !isDead && (
          <g fill="#E0FFFF" opacity="0.6">
            <circle cx="40"  cy="50" r="3" />
            <circle cx="30"  cy="60" r="2" />
            <circle cx="20"  cy="70" r="2" />
          </g>
        )}

        {/* 32) Lavender fish: floral swirl */}
        {colour === 'lavender' && !isDead && (
          <g stroke="#D8BFD8" strokeWidth="1" opacity="0.7">
            <path d="M60 30 C70 20, 100 20, 110 30" fill="none" />
            <path d="M60 70 C70 80, 100 80, 110 70" fill="none" />
          </g>
        )}

        {/* 33) Coral fish: coral-branch motif */}
        {colour === 'coral' && !isDead && (
          <g stroke="#FF7F50" strokeWidth="1" opacity="0.7">
            <path d="M80 30 L90 40 L80 50" fill="none" />
            <path d="M100 60 L110 70 L100 80" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}
