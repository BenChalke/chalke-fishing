// src/utils/fishUtils.js

import {
  COLOURS,
  PATTERNS,
  RARE_COLOURS,
  SUPER_COLOURS,
} from '../constants/fishConstants';

export const FISH_COUNT = 15;       // starting count for free play
export const FISH_SIZE = 120;       // base fish size
export const ENTRY_MULT = 3;        // spawn‐entry speed multiplier

/**
 * Returns a random on‐screen fish (justSpawned: false, speedMult:1).
 */
export function createRandomFish(id) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const angle = Math.random() * 2 * Math.PI;
  const x = Math.random() * (w - FISH_SIZE);
  const y = Math.random() * (h - FISH_SIZE / 2);

  let colour, pattern;
  const roll = Math.random();
  if (roll < 0.00040) {
    colour = 'aurora';   pattern = 'solid';
  } else if (roll < 0.00080) {
    colour = 'midnight'; pattern = 'solid';
  } else if (roll < 0.00120) {
    colour = 'obsidian'; pattern = 'solid';
  } else if (roll < 0.00160) {
    colour = 'galactic'; pattern = 'solid';
  } else if (roll < 0.00200) {
    colour = 'phantom';  pattern = 'solid';
  } else if (roll < 0.00240) {
    colour = 'rainbow';  pattern = 'striped';
  } else if (roll < 0.00280) {
    colour = 'volcano';  pattern = 'spotted';
  } else if (roll < 0.00500) {
    colour = 'emerald';  pattern = 'striped';
  } else if (roll < 0.00900) {
    colour = 'sunset';   pattern = 'spotted';
  } else if (roll < 0.01200) {
    colour = 'neon';     pattern = 'striped';
  } else if (roll < 0.01500) {
    colour = 'golden';   pattern = 'solid';
  } else if (roll < 0.01800) {
    colour = 'aqua';     pattern = 'spotted';
  } else if (roll < 0.02100) {
    colour = 'lavender'; pattern = 'striped';
  } else if (roll < 0.02400) {
    colour = 'coral';    pattern = 'spotted';
  } else {
    colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  }

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

  let colour, pattern;
  const roll = Math.random();
  if (roll < 0.00040) {
    colour = 'aurora';   pattern = 'solid';
  } else if (roll < 0.00080) {
    colour = 'midnight'; pattern = 'solid';
  } else if (roll < 0.00120) {
    colour = 'obsidian'; pattern = 'solid';
  } else if (roll < 0.00160) {
    colour = 'galactic'; pattern = 'solid';
  } else if (roll < 0.00200) {
    colour = 'phantom';  pattern = 'solid';
  } else if (roll < 0.00240) {
    colour = 'rainbow';  pattern = 'striped';
  } else if (roll < 0.00280) {
    colour = 'volcano';  pattern = 'spotted';
  } else if (roll < 0.00500) {
    colour = 'emerald';  pattern = 'striped';
  } else if (roll < 0.00900) {
    colour = 'sunset';   pattern = 'spotted';
  } else if (roll < 0.01200) {
    colour = 'neon';     pattern = 'striped';
  } else if (roll < 0.01500) {
    colour = 'golden';   pattern = 'solid';
  } else if (roll < 0.01800) {
    colour = 'aqua';     pattern = 'spotted';
  } else if (roll < 0.02100) {
    colour = 'lavender'; pattern = 'striped';
  } else if (roll < 0.02400) {
    colour = 'coral';    pattern = 'spotted';
  } else {
    colour  = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  }

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
  const arr = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    arr.push(createRandomFish(i));
  }
  return arr;
}
