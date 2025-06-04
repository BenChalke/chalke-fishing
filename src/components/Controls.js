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
}) {
  return (
    <>
      {/* Speed + fish count labels are always rendered */}
      <div className="speed-label">Speed: {speed.toFixed(1)}</div>
      <div className="fish-count-label">Fish Caught: {fishCount}</div>

      {/* If controls hidden, show only “Show Controls” button */}
      {!showControls ? (
        <button
          className="toggle-button show-button"
          onClick={onToggleVisibility}
          onTouchEnd={onToggleVisibility}
        >
          Show Controls
        </button>
      ) : (
        /* Otherwise, render all buttons in a flex‐container + “Hide Controls” toggle */
        <div className="button-container">
          <button
            className="control-button speed-down"
            onClick={onSpeedDown}
            onTouchEnd={onSpeedDown}
          >
            Speed–
          </button>
          <button
            className="control-button speed-up"
            onClick={onSpeedUp}
            onTouchEnd={onSpeedUp}
          >
            Speed+
          </button>
          <button
            className="control-button add-button"
            onClick={onAddFish}
            onTouchEnd={onAddFish}
          >
            Add Fish
          </button>
          <button
            className="control-button reset-button"
            onClick={onReset}
            onTouchEnd={onReset}
          >
            Reset Fish
          </button>
          <button
            className="control-button caught-button"
            onClick={onToggleStats}
            onTouchEnd={onToggleStats}
          >
            Fish Caught
          </button>
          {/* “Hide Controls” toggle placed last in the row/column */}
          <button
            className="toggle-button hide-button"
            onClick={onToggleVisibility}
            onTouchEnd={onToggleVisibility}
          >
            Hide Controls
          </button>
        </div>
      )}
    </>
  );
}
