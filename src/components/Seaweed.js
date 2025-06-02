import React from 'react';
import './Seaweed.css';

/**
 * Renders two seaweed clusters styled like your reference image:
 *   - A larger (left) cluster with three thick, wavy blades in blue-green and greens.
 *   - A smaller (right) cluster with three thinner blades in green tones.
 */
export default function Seaweed() {
  return (
    <>
      {/* —— Large Cluster (Left) —— */}
      <div className="seaweed-wrapper seaweed-large" style={{ left: '150px' }}>
        <svg viewBox="0 0 120 300" className="seaweed-svg">
          {/* 1) Sandy base */}
          <ellipse cx="60" cy="290" rx="60" ry="15" fill="#D2B48C" />

          {/* 2) Blade 1 (blue-green, far left) */}
          <path
            d="
              M30 290
              C 20 240, 10 200, 20 150
              C 35 100, 15  60, 25   0
            "
            fill="#3B8EAB"
            stroke="#2E6A7F"
            strokeWidth="4"
            className="seaweed-blade"
          />

          {/* 3) Blade 2 (dark green, center‐left) */}
          <path
            d="
              M60 290
              C 55 240, 50 200,  sixty 150
              C 75 100, 45  60, 55   0
            "
            fill="#2E8B57"
            stroke="#1C5E3D"
            strokeWidth="4"
            className="seaweed-blade"
          />

          {/* 4) Blade 3 (light green, center‐right) */}
          <path
            d="
              M90 290
              C 80 240, 75 200, 85 150
              C 100 100, 80  60, 85   0
            "
            fill="#A4D65E"
            stroke="#6B8F2A"
            strokeWidth="4"
            className="seaweed-blade"
          />
        </svg>
      </div>

      {/* —— Small Cluster (Right) —— */}
      <div className="seaweed-wrapper seaweed-small" style={{ left: '700px' }}>
        <svg viewBox="0 0 80 180" className="seaweed-svg">
          {/* 1) Sandy base */}
          <ellipse cx="40" cy="170" rx="40" ry="10" fill="#D2B48C" />

          {/* 2) Blade 1 (medium green, left) */}
          <path
            d="
              M20 170
              C 18 130, 15 100, 18  65
              C 22  35, 20  20, 18   0
            "
            fill="#2E8B57"
            stroke="#1C5E3D"
            strokeWidth="3"
            className="seaweed-blade"
          />

          {/* 3) Blade 2 (darker green, center) */}
          <path
            d="
              M40 170
              C 38 125, 35  95, 38  60
              C 42  30, 40  15, 38   0
            "
            fill="#1E6828"
            stroke="#144B1D"
            strokeWidth="3"
            className="seaweed-blade"
          />

          {/* 4) Blade 3 (light green, right) */}
          <path
            d="
              M60 170
              C 58 130, 55  95, 58  60
              C 62  30, 60  15, 58   0
            "
            fill="#7CFC00"
            stroke="#5EB700"
            strokeWidth="3"
            className="seaweed-blade"
          />
        </svg>
      </div>
    </>
  );
}
