// src/components/StatsPopup.js
import React from 'react';
import './StatsPopup.css';

// Import the same rare / super-rare constants
import {
  RARE_COLOURS,
  SUPER_COLOURS,
} from '../constants/fishConstants';

// Reuse the full Fish component at a small size
import Fish from './Fish';

/**
 * StatsPopup displays a modal with counts of each caught fish,
 * grouped into Super Rare, Rare, and Common sections.
 *
 * Props:
 *  - caughtRecords: array of strings like "emerald striped"
 *  - tally:        object mapping "colour pattern" → count
 *  - isMobile:     boolean
 *  - onClose:      callback to close the popup
 */
export default function StatsPopup({ caughtRecords, tally, isMobile, onClose }) {
  // Build arrays of [ "colour pattern", count ]
  const entries = Object.entries(tally);

  // Split into Super Rare / Rare / Common
  const superRareEntries = entries.filter(([typeStr]) => {
    const colour = typeStr.split(' ')[0];
    return SUPER_COLOURS.includes(colour);
  });
  const rareEntries = entries.filter(([typeStr]) => {
    const colour = typeStr.split(' ')[0];
    return RARE_COLOURS.includes(colour);
  });
  const commonEntries = entries.filter(([typeStr]) => {
    const colour = typeStr.split(' ')[0];
    return !SUPER_COLOURS.includes(colour) && !RARE_COLOURS.includes(colour);
  });

  // Sort alphabetically
  superRareEntries.sort((a, b) => a[0].localeCompare(b[0]));
  rareEntries.sort((a, b) => a[0].localeCompare(b[0]));
  commonEntries.sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="stats-popup-overlay" onClick={onClose}>
      <div
        className="stats-popup-content"
        onClick={(e) => e.stopPropagation()}
        style={isMobile ? { width: '85%', margin: '30px auto' } : {}}
      >
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <h2>Fish Caught</h2>

        <div className="popup-body">
          {/* Super Rare Section */}
          {superRareEntries.length > 0 && (
            <div className="stats-section">
              <h3 className="super-rare-label"><strong>Super Rare</strong></h3>
              <ul>
                {superRareEntries.map(([typeStr, count]) => {
                  const [colour, pattern] = typeStr.split(' ');
                  return (
                    <li key={typeStr} className="caught-item">
                      <div className="mini-fish-container">
                        <Fish
                          x={0}
                          y={0}
                          size={40}               /* 40px wide, 20px tall */
                          colour={colour}
                          pattern={pattern}
                          angle={0}
                          speed={1}               /* speed doesn’t matter */
                          onClick={() => {}}
                          isDead={false}
                          isMobile={false}
                        />
                      </div>
                      <span className="stat-fish-type">{typeStr}</span>
                      <span className="stat-count">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Rare Section */}
          {rareEntries.length > 0 && (
            <div className="stats-section">
              <h3 className="rare-label"><strong>Rare</strong></h3>
              <ul>
                {rareEntries.map(([typeStr, count]) => {
                  const [colour, pattern] = typeStr.split(' ');
                  return (
                    <li key={typeStr} className="caught-item">
                      <div className="mini-fish-container">
                        <Fish
                          x={0}
                          y={0}
                          size={40}
                          colour={colour}
                          pattern={pattern}
                          angle={0}
                          speed={1}
                          onClick={() => {}}
                          isDead={false}
                          isMobile={false}
                        />
                      </div>
                      <span className="stat-fish-type">{typeStr}</span>
                      <span className="stat-count">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Common Section */}
          {commonEntries.length > 0 && (
            <div className="stats-section common-group">
              <h3>Common</h3>
              <ul>
                {commonEntries.map(([typeStr, count]) => {
                  const [colour, pattern] = typeStr.split(' ');
                  return (
                    <li key={typeStr} className="caught-item">
                      <div className="mini-fish-container">
                        <Fish
                          x={0}
                          y={0}
                          size={40}
                          colour={colour}
                          pattern={pattern}
                          angle={0}
                          speed={1}
                          onClick={() => {}}
                          isDead={false}
                          isMobile={false}
                        />
                      </div>
                      <span className="stat-fish-type">{typeStr}</span>
                      <span className="stat-count">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* No fish caught yet */}
          {caughtRecords.length === 0 && (
            <p className="no-fish-text">
              You haven’t caught any fish yet!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
