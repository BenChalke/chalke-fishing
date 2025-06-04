// src/components/StatsPopup.js
import React from 'react';
import './StatsPopup.css';
import Fish from './Fish';

const RARE_COLOURS  = ['red', 'pink', 'silver'];
const SUPER_COLOURS = ['crimson', 'cyan'];

export default function StatsPopup({ caughtRecords, tally, isMobile, onClose }) {
  return (
    <div className="caught-popup-overlay" onClick={onClose}>
      <div className="caught-popup-content" onClick={(e) => e.stopPropagation()}>
        {/* Close “×” button */}
        <button className="popup-close-x" onClick={onClose}>
          ×
        </button>
        <h2>Fish Caught</h2>
        <div className="popup-body">
          {caughtRecords.length === 0 ? (
            <p>No fish caught yet.</p>
          ) : (
            <div>
              {/* 1) Super‐rare fish first */}
              <ul>
                {Object.entries(tally)
                  .filter(([typeStr]) => {
                    const [colour] = typeStr.split(' ');
                    return SUPER_COLOURS.includes(colour);
                  })
                  .map(([typeStr, count]) => {
                    const [colour, pattern] = typeStr.split(' ');
                    const capitalized = typeStr
                      .split(' ')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');
                    return (
                      <li key={typeStr} className="caught-item">
                        <div className="mini-fish-container">
                          <Fish
                            x={0}
                            y={0}
                            size={50}
                            colour={colour}
                            pattern={pattern}
                            isDead={false}
                            isMobile={isMobile}
                          />
                        </div>
                        <span className="super-rare-label">
                          <strong>Super Rare {capitalized}:</strong> {count}
                        </span>
                      </li>
                    );
                  })}
              </ul>

              {/* 2) Rare fish next */}
              <ul>
                {Object.entries(tally)
                  .filter(([typeStr]) => {
                    const [colour] = typeStr.split(' ');
                    return RARE_COLOURS.includes(colour);
                  })
                  .map(([typeStr, count]) => {
                    const [colour, pattern] = typeStr.split(' ');
                    const capitalized = typeStr
                      .split(' ')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');
                    return (
                      <li key={typeStr} className="caught-item">
                        <div className="mini-fish-container">
                          <Fish
                            x={0}
                            y={0}
                            size={40}
                            colour={colour}
                            pattern={pattern}
                            isDead={false}
                            isMobile={isMobile}
                          />
                        </div>
                        <span className="rare-label">
                          <strong>Rare {capitalized}:</strong> {count}
                        </span>
                      </li>
                    );
                  })}
              </ul>

              {/* 3) Common fish grouped by colour */}
              {(() => {
                const commonEntries = Object.entries(tally).filter(
                  ([typeStr]) => {
                    const [colour] = typeStr.split(' ');
                    return (
                      !RARE_COLOURS.includes(colour) &&
                      !SUPER_COLOURS.includes(colour)
                    );
                  }
                );
                const commonByColour = {};
                commonEntries.forEach(([typeStr, count]) => {
                  const [colour, pattern] = typeStr.split(' ');
                  if (!commonByColour[colour]) {
                    commonByColour[colour] = [];
                  }
                  commonByColour[colour].push({ pattern, count });
                });

                return Object.keys(commonByColour).map((colour) => {
                  const colourHeading =
                    colour.charAt(0).toUpperCase() + colour.slice(1);
                  return (
                    <div key={colour} className="common-group">
                      <h3>{colourHeading}</h3>
                      <ul>
                        {commonByColour[colour].map(({ pattern, count }) => {
                          const patternLabel =
                            pattern.charAt(0).toUpperCase() + pattern.slice(1);
                          const typeStr = `${colour} ${pattern}`;
                          return (
                            <li key={typeStr} className="caught-item">
                              <div className="mini-fish-container">
                                <Fish
                                  x={0}
                                  y={0}
                                  size={40}
                                  colour={colour}
                                  pattern={pattern}
                                  isDead={false}
                                  isMobile={isMobile}
                                />
                              </div>
                              <span>
                                {patternLabel}: {count}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
