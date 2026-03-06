// src/utils/fishUtils.js

import {
  COLOURS,
  PATTERNS,
} from '../constants/fishConstants';

export const FISH_COUNT = 22;       // fallback only — prefer viewportFishCount()

/** Returns a fish count scaled to the viewport area (min 8, max 50). */
export function viewportFishCount() {
  return Math.max(8, Math.min(50, Math.round(window.innerWidth * window.innerHeight / 70000)));
}
export const FISH_SIZE = 120;       // base fish size
export const ENTRY_MULT = 3;        // spawn‐entry speed multiplier

/**
 * Returns a random { colour, pattern } based on weighted rarity rolls.
 */
function rollFishColour() {
  const roll = Math.random();
  if (roll < 0.00040) return { colour: 'aurora',   pattern: 'solid'   };
  if (roll < 0.00080) return { colour: 'midnight', pattern: 'solid'   };
  if (roll < 0.00120) return { colour: 'obsidian', pattern: 'solid'   };
  if (roll < 0.00160) return { colour: 'galactic', pattern: 'solid'   };
  if (roll < 0.00200) return { colour: 'phantom',  pattern: 'solid'   };
  if (roll < 0.00240) return { colour: 'rainbow',  pattern: 'striped' };
  if (roll < 0.00280) return { colour: 'volcano',  pattern: 'spotted' };
  if (roll < 0.00500) return { colour: 'emerald',  pattern: 'striped' };
  if (roll < 0.00900) return { colour: 'sunset',   pattern: 'spotted' };
  if (roll < 0.01200) return { colour: 'neon',     pattern: 'striped' };
  if (roll < 0.01500) return { colour: 'golden',   pattern: 'solid'   };
  if (roll < 0.01800) return { colour: 'aqua',     pattern: 'spotted' };
  if (roll < 0.02100) return { colour: 'lavender', pattern: 'striped' };
  if (roll < 0.02400) return { colour: 'coral',    pattern: 'spotted' };
  return {
    colour:  COLOURS[Math.floor(Math.random() * COLOURS.length)],
    pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)],
  };
}

/**
 * Returns a random on‐screen fish (justSpawned: false, speedMult:1).
 */
export function createRandomFish(id) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const angle = Math.random() * 2 * Math.PI;
  const x = Math.random() * (w - FISH_SIZE);
  const y = Math.random() * (h - FISH_SIZE / 2);
  const { colour, pattern } = rollFishColour();

  return {
    id,
    x,
    y,
    angle,
    colour,
    pattern,
    justSpawned: false,
    speedMult: 1,
  };
}

/**
 * Returns a new fish spawned just off‐screen, heading quickly inward (justSpawned: true, speedMult:ENTRY_MULT).
 */
export function createOffscreenFish(id) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fishHeight = FISH_SIZE * 0.5;
  const edge = Math.floor(Math.random() * 4);  // 0=left,1=right,2=top,3=bottom

  let x, y, angle;
  if (edge === 0) {
    x = -FISH_SIZE;
    y = Math.random() * (h - fishHeight);
    angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  } else if (edge === 1) {
    x = w;
    y = Math.random() * (h - fishHeight);
    angle = Math.PI + (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  } else if (edge === 2) {
    x = Math.random() * (w - FISH_SIZE);
    y = -fishHeight;
    angle = (Math.PI / 4) + (Math.random() * (Math.PI / 2));
  } else {
    x = Math.random() * (w - FISH_SIZE);
    y = h;
    angle = - (Math.PI / 4) - (Math.random() * (Math.PI / 2));
  }

  const { colour, pattern } = rollFishColour();

  return {
    id,
    x,
    y,
    angle,
    colour,
    pattern,
    justSpawned: true,
    speedMult: ENTRY_MULT,
  };
}

/**
 * Create the initial on‐screen fishes array (size FISH_COUNT).
 */
export function createInitialFish() {
  const count = viewportFishCount();
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(createRandomFish(i));
  }
  return arr;
}
