// src/components/WelcomePopup.js
import React from 'react';
import './WelcomePopup.css';

export default function WelcomePopup({ onClose }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-content">
        <h2>Welcome to My Fishing App</h2>
        <p>
          See what fish you can catch. There are <strong>rare</strong> and{' '}
          <strong>super rare</strong> fish to collect. You can speed up or slow
          down&nbsp;the fish depending on how good you think you are. Good luck
          and happy fishing!
        </p>
        <button className="welcome-close" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}
