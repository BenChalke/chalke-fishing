// src/components/InfoPopup.js
import React from 'react';
import './InfoPopup.css';

import Fish from './Fish';
import {
  COLOURS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from '../constants/fishConstants';

/**
 * InfoPopup displays a modal with information on fish rarity.
 *
 * Props:
 *  - isMobile: boolean
 *  - onClose:  callback to close the popup
 */
export default function InfoPopup({ isMobile, onClose }) {
  // Determine common colours by excluding rare and super-rare
  const commonColours = COLOURS.filter(
    (colour) => !RARE_COLOURS.includes(colour) && !SUPER_COLOURS.includes(colour)
  );

  return (
    <div className="info-popup-overlay" onClick={onClose}>
      <div
        className="info-popup-content"
        onClick={(e) => e.stopPropagation()}
        style={isMobile ? { width: '80%', margin: '40px auto' } : {}}
      >
        <button className="popup-close-x" onClick={onClose}>
          ✕
        </button>

        <h2>Fish Information</h2>

        <div className="info-section">
          <h3><strong>Super Rare Fish</strong></h3>
          <ul>
            {SUPER_COLOURS.map((colour) => (
              <li key={colour} className="info-item">
                <div className="mini-fish-container">
                  <Fish
                    x={0}
                    y={0}
                    size={40}
                    colour={colour}
                    pattern="solid"
                    isMobile={false}
                  />
                </div>
                <span className="info-text">
                  <span className="info-fish-name">{colour}</span> – 0.0016% chance of spawning
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3><strong>Rare Fish</strong></h3>
          <ul>
            {RARE_COLOURS.map((colour) => (
              <li key={colour} className="info-item">
                <div className="mini-fish-container">
                  <Fish
                    x={0}
                    y={0}
                    size={40}
                    colour={colour}
                    pattern="solid"
                    isMobile={false}
                  />
                </div>
                <span className="info-text">
                  <span className="info-fish-name">{colour}</span> – 0.005% chance of spawning
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>Common Fish</h3>
          <ul>
            {commonColours.map((colour) => (
              <li key={colour} className="info-item">
                <div className="mini-fish-container">
                  <Fish
                    x={0}
                    y={0}
                    size={40}
                    colour={colour}
                    pattern="solid"
                    isMobile={false}
                  />
                </div>
                <span className="info-text">
                  <span className="info-fish-name">{colour}</span> – high chance of spawning
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="info-notes">
          <p>
            Each fish also has one of three patterns: <em>solid</em>, <em>striped</em>, or <em>spotted</em>. Rarity is determined solely by colour.
          </p>
        </div>
      </div>
    </div>
  );
}
