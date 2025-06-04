// src/components/Controls.js
import React from 'react';
import './Controls.css';

export default function Controls({
  speed,
  fishCount,
  onSpeedDown,
  onSpeedUp,
  onAddFish,
  onReset,
  onToggleStats,
  showControls,
  onToggleVisibility,
  isMobile,               // new prop
}) {
  return (
    <>
      {/* Speed + fish count labels always visible */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>
      <div className="fish-count-label">Fish Caught: {fishCount}</div>

      {!showControls ? (
        /* “Show Controls” button when hidden */
        <button
          className="toggle-button show-button"
          {...(isMobile
            ? { onTouchStart: onToggleVisibility }
            : { onClick: onToggleVisibility })}
        >
          Show Controls
        </button>
      ) : (
        /* Full set of buttons + “Hide Controls” when visible */
        <div className="button-container">
          <button
            className="control-button speed-down"
            {...(isMobile
              ? { onTouchStart: onSpeedDown }
              : { onClick: onSpeedDown })}
          >
            Speed–
          </button>
          <button
            className="control-button speed-up"
            {...(isMobile
              ? { onTouchStart: onSpeedUp }
              : { onClick: onSpeedUp })}
          >
            Speed+
          </button>
          <button
            className="control-button add-button"
            {...(isMobile
              ? { onTouchStart: onAddFish }
              : { onClick: onAddFish })}
          >
            Add Fish
          </button>
          <button
            className="control-button reset-button"
            {...(isMobile
              ? { onTouchStart: onReset }
              : { onClick: onReset })}
          >
            Reset Fish
          </button>
          <button
            className="control-button caught-button"
            {...(isMobile
              ? { onTouchStart: onToggleStats }
              : { onClick: onToggleStats })}
          >
            Fish Caught
          </button>
          <button
            className="toggle-button hide-button"
            {...(isMobile
              ? { onTouchStart: onToggleVisibility }
              : { onClick: onToggleVisibility })}
          >
            Hide Controls
          </button>
        </div>
      )}
    </>
  );
}
