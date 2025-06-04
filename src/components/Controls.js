// src/components/Controls.js
import React from 'react';
import './Controls.css';

export default function Controls({
  onSpeedDown,
  onSpeedUp,
  onAddFish,
  onReset,
  isMobile,
}) {
  return (
    <div className="controls-container">
      <button
        className="control-button speed-down"
        {...(isMobile ? { onTouchStart: onSpeedDown } : { onClick: onSpeedDown })}
      >
        Speed –
      </button>
      <button
        className="control-button speed-up"
        {...(isMobile ? { onTouchStart: onSpeedUp } : { onClick: onSpeedUp })}
      >
        Speed +
      </button>
      {/* <button
        className="control-button add-button"
        {...(isMobile ? { onTouchStart: onAddFish } : { onClick: onAddFish })}
      >
        Add Fish
      </button> */}
      <button
        className="control-button reset-button"
        {...(isMobile ? { onTouchStart: onReset } : { onClick: onReset })}
      >
        Reset Fish
      </button>
    </div>
  );
}
