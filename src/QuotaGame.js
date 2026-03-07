// src/QuotaGame.js
import React, { useState, useEffect, useRef } from 'react';
import FishDisplay from './components/FishDisplay';
import FishField   from './components/FishField';
import Fish        from './components/Fish';
import BonusFish   from './components/BonusFish';

import { COLOURS, PATTERNS, RARE_COLOURS, SUPER_COLOURS } from './constants/fishConstants';
import {
  createRandomFish,
  createOffscreenFish,
  FISH_SIZE,
  viewportFishCount,
  ENTRY_MULT,
} from './utils/fishUtils';

import { leaderboardEnabled, submitScore } from './utils/leaderboard';
import './QuotaGame.css';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Tuning ────────────────────────────────────────────────────────────────────
const BONUS_FISH_SIZE     = 150;
const BONUS_FISH_LIFESPAN = 8000;
const SPEED_FISH_CHANCE   = 0.12;
const SPEED_FISH_LIFESPAN = 12000;
const DESKTOP_TICK        = 30;
const MOBILE_TICK         = 30;
const FRENZY_FISH_MULT    = 3.5;
const DESKTOP_FRENZY_INT  = 150;
const MOBILE_FRENZY_INT   = 400;
const FRENZY_SPEED_MULT        = 1.75;
const MOBILE_FRENZY_SPEED_MULT = 1.6;
const BAD_FISH_SPAWN_DELAY = 2500;
const BAD_FISH_SPEED_MULT  = 4.0;
const BAD_FISH_TURN_MIN    = 1500;
const BAD_FISH_TURN_MAX    = 3000;
const FISH_SCATTER_SPEED   = 12;
const TIME_BONUS_SECS      = 8;
const TIME_URGENT_SECS     = 8;

// Quota required per level { common, rare, super }
const LEVEL_QUOTAS = [
  { common: 5, rare: 0, super: 0 },
  { common: 5, rare: 1, super: 0 },
  { common: 6, rare: 2, super: 0 },
  { common: 6, rare: 2, super: 1 },
  { common: 8, rare: 3, super: 1 },
  { common: 8, rare: 4, super: 2 },
  { common: 10, rare: 4, super: 2 },
  { common: 10, rare: 5, super: 3 },
];
function getLevelQuota(level) {
  if (level <= LEVEL_QUOTAS.length) return LEVEL_QUOTAS[level - 1];
  const extra = level - LEVEL_QUOTAS.length;
  const base  = LEVEL_QUOTAS[LEVEL_QUOTAS.length - 1];
  return { common: base.common + extra * 2, rare: base.rare + extra, super: base.super + Math.ceil(extra / 2) };
}

function getLevelTime(level)  { return Math.max(20, 45 - (level - 1) * 3); }
function getLevelSpeed(level) { return Math.min(8.0, 3.5 + (level - 1) * 0.3); }

function nearestEdgeAngle(x, y, fishSize = FISH_SIZE) {
  const w = window.innerWidth, h = window.innerHeight;
  const cx = x + fishSize / 2, cy = y + fishSize * 0.25;
  const distances = [cx, w - cx, cy, h - cy];
  const angles    = [Math.PI, 0, -Math.PI / 2, Math.PI / 2];
  return angles[distances.indexOf(Math.min(...distances))];
}

function createMaybeFastFish(id) {
  const fish = createOffscreenFish(id);
  if (Math.random() < SPEED_FISH_CHANCE) {
    return { ...fish, speedFish: true, postEntrySpeedMult: 2.0, spawnedAt: Date.now() };
  }
  return fish;
}

function moveSingleFish(fish, speed, cursor, isMobile, slowmoEndTs, frenzyEndTs = 0, fishSize = FISH_SIZE) {
  const w = window.innerWidth, h = window.innerHeight;
  const fishHeight = fishSize * 0.5;
  const { x, y, angle, speedMult } = fish;
  const now        = Date.now();
  const frenzyMult = frenzyEndTs > 0 && now < frenzyEndTs ? (isMobile ? MOBILE_FRENZY_SPEED_MULT : FRENZY_SPEED_MULT) : 1;
  const effSpeed   = speed * speedMult * (now < slowmoEndTs ? 0.35 : 1) * frenzyMult;
  if (fish.swimOff) {
    const nx = x + Math.cos(angle) * effSpeed, ny = y + Math.sin(angle) * effSpeed;
    return { ...fish, x: nx, y: ny, remove: nx + fishSize < 0 || nx > w || ny + fishHeight < 0 || ny > h };
  }
  if (fish.justSpawned) {
    const cx = x + fishSize / 2, cy = y + fishHeight / 2;
    const at = Math.atan2(h / 2 - cy, w / 2 - cx);
    const nx = x + Math.cos(at) * effSpeed, ny = y + Math.sin(at) * effSpeed;
    const inside = nx >= 0 && nx + fishSize <= w && ny >= 0 && ny + fishHeight <= h;
    return { ...fish, x: nx, y: ny, angle: inside ? at + (Math.random() - 0.5) * (Math.PI * 0.75) : at,
      justSpawned: !inside, speedMult: inside ? (fish.postEntrySpeedMult ?? 1) : ENTRY_MULT };
  }
  const nx = x + Math.cos(angle) * effSpeed, ny = y + Math.sin(angle) * effSpeed;
  if (nx + fishSize < 0 || nx > w || ny + fishHeight < 0 || ny > h) return { ...fish, x: nx, y: ny, remove: true };
  return { ...fish, x: nx, y: ny };
}

// ────────────────────────────────────────────────────────────────────────────

export default function QuotaGame({ onBackToHome, onPlayAgain, onGoHighScore }) {
  const [phase, setPhase]               = useState('countdown');
  const [displayNumber, setDisplayNumber] = useState(3);
  const [level, setLevel]               = useState(1);
  const [timeLeft, setTimeLeft]         = useState(getLevelTime(1));
  const [levelUpFlash, setLevelUpFlash]         = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [completedLevel, setCompletedLevel]       = useState(null);
  const [showLevelCard, setShowLevelCard]         = useState(false);
  const [levelCardQuota, setLevelCardQuota]       = useState(null);

  // Per-level quota progress (resets on level up)
  const [caughtCommon, setCaughtCommon] = useState(0);
  const [caughtRare,   setCaughtRare]   = useState(0);
  const [caughtSuper,  setCaughtSuper]  = useState(0);
  const caughtCommonRef = useRef(0);
  const caughtRareRef   = useRef(0);
  const caughtSuperRef  = useRef(0);

  const [fishArray, setFishArray]         = useState([]);
  const [speed, setSpeed]                 = useState(getLevelSpeed(1));
  const [cursorPos, setCursorPos]         = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking]         = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords] = useState({});
  const [isMobile, setIsMobile]           = useState(false);
  const [scoreNotifs, setScoreNotifs]     = useState([]);
  const [gameOverView, setGameOverView]   = useState('summary');
  const [menuVisible, setMenuVisible]     = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const [playerName, setPlayerName]       = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError]     = useState('');
  const sessionToken                      = useRef(generateUUID());

  const [bonusFish, setBonusFish]             = useState([]);
  const [badFish, setBadFish]                 = useState([]);
  const [effectsDisplay, setEffectsDisplay]   = useState({ frenzy: 0, multiplier: 0, slowmo: 0 });
  const [powerUpNotifs, setPowerUpNotifs]     = useState([]);
  const [screenFlash, setScreenFlash]         = useState(null);

  const nextNotif           = useRef(0);
  const cursorRef           = useRef({ x: -1000, y: -1000 });
  const nextId              = useRef(FISH_SIZE);
  const speedRef            = useRef(getLevelSpeed(1));
  const isMobileRef         = useRef(false);
  const initialFishCount    = useRef(0);
  const frenzyEndRef        = useRef(0);
  const multiplierEndRef    = useRef(0);
  const slowmoEndRef        = useRef(0);
  const frenzySpawnRef      = useRef(null);
  const frenzyCleanedRef    = useRef(true);
  const bonusFishRef        = useRef([]);
  const bonusSpawnTimerRef  = useRef(null);
  const badFishRef          = useRef([]);
  const badFishTimerRef     = useRef(null);
  const fishRespawnTimerRef = useRef(null);
  const levelRef            = useRef(1);
  const totalFishRef        = useRef(0); // total fish caught across all levels
  const pausedRef           = useRef(true); // true while level card is showing

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const mobile = 'ontouchstart' in window;
    isMobileRef.current = mobile;
    setIsMobile(mobile);
    const count = viewportFishCount();
    initialFishCount.current = count;
    setFishArray(Array.from({ length: count }, (_, i) => createRandomFish(i)));
  }, []);

  useEffect(() => {
    let pendingRAF = null;
    const onMove = (e) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (!pendingRAF) {
        pendingRAF = requestAnimationFrame(() => { setCursorPos({ ...cursorRef.current }); pendingRAF = null; });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); if (pendingRAF) cancelAnimationFrame(pendingRAF); };
  }, []);

  const handlePointerDown = (e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    cursorRef.current = { x: clientX, y: clientY };
    setCursorPos({ x: clientX, y: clientY });
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (typeof displayNumber === 'number' && displayNumber > 0) {
      const t = setTimeout(() => setDisplayNumber((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }
    if (displayNumber === 0) {
      const t = setTimeout(() => { setDisplayNumber('Go!'); setPhase('running'); }, 1000);
      return () => clearTimeout(t);
    }
  }, [displayNumber, phase]);

  const spawnPowerUpNotif = (type) => {
    const labels = { frenzy: 'FRENZY!', timebonus: `+${TIME_BONUS_SECS}s!`, multiplier: 'x2!', slowmo: 'SLOW!', bad: '☠ SCATTER!', free: 'FREE!', lure: 'LURE!' };
    const id = nextNotif.current++;
    setPowerUpNotifs((prev) => [...prev, { id, type, label: labels[type] ?? '!', x: window.innerWidth / 2, y: window.innerHeight / 2 }]);
    setTimeout(() => setPowerUpNotifs((prev) => prev.filter((n) => n.id !== id)), 1500);
  };

  const COMMON_COLOURS = COLOURS.filter((c) => !RARE_COLOURS.includes(c) && !SUPER_COLOURS.includes(c));

  const injectGuaranteedFish = (lv) => {
    const q = getLevelQuota(lv);
    const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];
    const pickPattern = () => PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    const seeds = [];
    if (q.common > 0) seeds.push({ ...createRandomFish(nextId.current++), colour: pick(COMMON_COLOURS), pattern: pickPattern() });
    if (q.rare   > 0) seeds.push({ ...createRandomFish(nextId.current++), colour: pick(RARE_COLOURS),   pattern: pickPattern() });
    if (q.super  > 0) seeds.push({ ...createRandomFish(nextId.current++), colour: pick(SUPER_COLOURS),  pattern: pickPattern() });
    if (seeds.length > 0) setFishArray((prev) => [...prev, ...seeds]);
  };

  const dismissLevelCard = (e) => {
    e.stopPropagation();
    setShowLevelCard(false);
    pausedRef.current = false;
    injectGuaranteedFish(levelRef.current);
  };

  const triggerLevelUp = () => {
    const finishedLevel = levelRef.current;
    const newLevel = finishedLevel + 1;
    levelRef.current = newLevel;
    setLevel(newLevel);
    caughtCommonRef.current = 0; setCaughtCommon(0);
    caughtRareRef.current   = 0; setCaughtRare(0);
    caughtSuperRef.current  = 0; setCaughtSuper(0);
    const newSpeed = getLevelSpeed(newLevel);
    speedRef.current = newSpeed;
    setSpeed(newSpeed);
    setTimeLeft(getLevelTime(newLevel));
    setLevelUpFlash(true);
    setTimeout(() => setLevelUpFlash(false), 800);
    // Pause clock, show level-complete screen, then level card after delay
    pausedRef.current = true;
    setCompletedLevel(finishedLevel);
    setShowLevelComplete(true);
    setTimeout(() => {
      setShowLevelComplete(false);
      setLevelCardQuota(getLevelQuota(newLevel));
      setShowLevelCard(true);
    }, 2000);
  };

  // Show level card when game first starts (clock paused until dismissed)
  useEffect(() => {
    if (phase !== 'running') return;
    pausedRef.current = true;
    setLevelCardQuota(getLevelQuota(1));
    setShowLevelCard(true);
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    if (phase !== 'running') return;
    const mobile  = isMobileRef.current;
    const TICK_MS = mobile ? MOBILE_TICK : DESKTOP_TICK;
    const target  = initialFishCount.current;

    const scheduleBonusSpawn = (isFirst = false) => {
      const delay = isFirst ? 2000 + Math.random() * 3000 : 7000 + Math.random() * 4000;
      bonusSpawnTimerRef.current = setTimeout(() => {
        const types = ['frenzy', 'timebonus', 'slowmo', 'free', 'lure'];
        const type  = types[Math.floor(Math.random() * types.length)];
        const fish  = { ...createOffscreenFish(nextId.current++), type, spawnedAt: Date.now(), postEntrySpeedMult: 1.3 };
        bonusFishRef.current = [...bonusFishRef.current, fish];
        setBonusFish([...bonusFishRef.current]);
        scheduleBonusSpawn(false);
      }, delay);
    };
    scheduleBonusSpawn(true);

    const fishInterval = setInterval(() => {
      const now       = Date.now();
      const frenzyDone = frenzyEndRef.current > 0 && now > frenzyEndRef.current;
      const doCleanup  = frenzyDone && !frenzyCleanedRef.current;
      if (doCleanup) frenzyCleanedRef.current = true;

      setFishArray((prev) => {
        let result = prev.map((f) => moveSingleFish(f, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, frenzyEndRef.current));
        const exitedCount = result.filter((f) => f.remove && !f.swimOff).length;
        result = result.filter((f) => !f.remove);
        for (let i = 0; i < exitedCount; i++) result.push(createMaybeFastFish(nextId.current++));
        if (doCleanup) {
          const activeNormal = result.filter((f) => !f.swimOff && !f.speedFish);
          const excess = Math.max(0, activeNormal.length - target);
          let marked = 0;
          result = result.map((f) => {
            if (!f.swimOff && !f.speedFish && marked < excess) {
              marked++;
              return { ...f, swimOff: true, justSpawned: false, speedMult: FISH_SCATTER_SPEED, angle: nearestEdgeAngle(f.x, f.y) };
            }
            return f;
          });
        }
        result = result.map((f) => {
          if (f.speedFish && !f.swimOff && f.spawnedAt && now - f.spawnedAt > SPEED_FISH_LIFESPAN) {
            return { ...f, swimOff: true, angle: nearestEdgeAngle(f.x, f.y) };
          }
          return f;
        });
        return result;
      });

      if (bonusFishRef.current.length > 0) {
        const updated = bonusFishRef.current
          .map((bf) => {
            if (now - bf.spawnedAt > BONUS_FISH_LIFESPAN && !bf.swimOff)
              return { ...bf, swimOff: true, angle: nearestEdgeAngle(bf.x, bf.y, BONUS_FISH_SIZE) };
            return moveSingleFish(bf, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, 0, BONUS_FISH_SIZE);
          })
          .filter((bf) => !bf.remove);
        bonusFishRef.current = updated;
        setBonusFish(updated);
      }

      if (badFishRef.current.length > 0) {
        if (doCleanup) {
          badFishRef.current = []; setBadFish([]);
        } else {
          const updated = badFishRef.current.map((bdf) => {
            let fish = bdf;
            if (!fish.justSpawned && now > fish.nextTurnAt) {
              fish = { ...fish, angle: Math.random() * 2 * Math.PI,
                nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN) };
            }
            const moved = moveSingleFish(fish, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, 0, BONUS_FISH_SIZE);
            if (moved.remove) {
              return { ...createOffscreenFish(nextId.current++), type: 'bad', postEntrySpeedMult: BAD_FISH_SPEED_MULT,
                nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN) };
            }
            return moved;
          });
          badFishRef.current = updated; setBadFish(updated);
        }
      }
    }, TICK_MS);

    const timeInterval = setInterval(() => {
      const now = Date.now();
      setEffectsDisplay({
        frenzy:     Math.max(0, Math.round((frenzyEndRef.current    - now) / 1000)),
        multiplier: Math.max(0, Math.round((multiplierEndRef.current - now) / 1000)),
        slowmo:     Math.max(0, Math.round((slowmoEndRef.current    - now) / 1000)),
      });
      setTimeLeft((t) => {
        if (pausedRef.current) return t; // clock paused while level card showing
        if (t <= 1) {
          clearInterval(fishInterval);
          clearInterval(timeInterval);
          clearTimeout(bonusSpawnTimerRef.current);
          clearInterval(frenzySpawnRef.current);
          clearTimeout(badFishTimerRef.current);
          clearTimeout(fishRespawnTimerRef.current);
          badFishRef.current = []; setBadFish([]);
          setPhase('gameover');
          return 0;
        }
        if (now < slowmoEndRef.current) return t;
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(fishInterval);
      clearInterval(timeInterval);
      clearTimeout(bonusSpawnTimerRef.current);
      clearInterval(frenzySpawnRef.current);
      clearTimeout(badFishTimerRef.current);
      clearTimeout(fishRespawnTimerRef.current);
    };
  }, [phase]); // eslint-disable-line

  const handleBonusFishClick = (fishId, e) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    const bf = bonusFishRef.current.find((f) => f.id === fishId);
    if (!bf) return;
    const { type } = bf;
    bonusFishRef.current = bonusFishRef.current.filter((f) => f.id !== fishId);
    setBonusFish([...bonusFishRef.current]);
    setScreenFlash(type);
    setTimeout(() => setScreenFlash(null), 700);
    const now    = Date.now();
    const mobile = isMobileRef.current;
    if (type === 'frenzy') {
      frenzyEndRef.current = now + 10000;
      frenzyCleanedRef.current = false;
      clearInterval(frenzySpawnRef.current);
      frenzySpawnRef.current = setInterval(() => {
        if (Date.now() > frenzyEndRef.current) { clearInterval(frenzySpawnRef.current); return; }
        setFishArray((prev) => {
          if (prev.length >= Math.round(initialFishCount.current * FRENZY_FISH_MULT)) return prev;
          return [...prev, createOffscreenFish(nextId.current++)];
        });
      }, mobile ? MOBILE_FRENZY_INT : DESKTOP_FRENZY_INT);
      clearTimeout(badFishTimerRef.current);
      badFishTimerRef.current = setTimeout(() => {
        if (frenzyEndRef.current <= 0 || Date.now() >= frenzyEndRef.current) return;
        const count = mobile ? 2 : 4;
        const spawnedAt = Date.now();
        const newBadFish = Array.from({ length: count }, () => ({
          ...createOffscreenFish(nextId.current++), type: 'bad', spawnedAt,
          postEntrySpeedMult: BAD_FISH_SPEED_MULT,
          nextTurnAt: spawnedAt + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN),
        }));
        badFishRef.current = newBadFish; setBadFish(newBadFish);
      }, BAD_FISH_SPAWN_DELAY);
    } else if (type === 'timebonus') {
      const cap = getLevelTime(levelRef.current) + TIME_BONUS_SECS;
      setTimeLeft((prev) => Math.min(prev + TIME_BONUS_SECS, cap));
    } else if (type === 'free') {
      // Auto-catch +1 of each incomplete quota category
      const quota = getLevelQuota(levelRef.current);
      let caught = 0;
      if (caughtCommonRef.current < quota.common) {
        caughtCommonRef.current++;
        setCaughtCommon(caughtCommonRef.current);
        caught++;
      }
      if (quota.rare > 0 && caughtRareRef.current < quota.rare) {
        caughtRareRef.current++;
        setCaughtRare(caughtRareRef.current);
        caught++;
      }
      if (quota.super > 0 && caughtSuperRef.current < quota.super) {
        caughtSuperRef.current++;
        setCaughtSuper(caughtSuperRef.current);
        caught++;
      }
      totalFishRef.current += caught;
      // Check if quota is now complete
      if (
        caughtCommonRef.current >= quota.common &&
        caughtRareRef.current   >= quota.rare   &&
        caughtSuperRef.current  >= quota.super
      ) {
        triggerLevelUp();
      }
    } else if (type === 'lure') {
      // Spawn guaranteed quota fish on screen (still need to catch manually)
      const quota = getLevelQuota(levelRef.current);
      const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];
      const pickPattern = () => PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      const seeds = [];
      if (caughtCommonRef.current < quota.common) {
        const need = Math.min(3, quota.common - caughtCommonRef.current);
        for (let i = 0; i < need; i++)
          seeds.push({ ...createRandomFish(nextId.current++), colour: pick(COMMON_COLOURS), pattern: pickPattern() });
      }
      if (quota.rare > 0 && caughtRareRef.current < quota.rare) {
        const need = Math.min(2, quota.rare - caughtRareRef.current);
        for (let i = 0; i < need; i++)
          seeds.push({ ...createRandomFish(nextId.current++), colour: pick(RARE_COLOURS), pattern: pickPattern() });
      }
      if (quota.super > 0 && caughtSuperRef.current < quota.super) {
        seeds.push({ ...createRandomFish(nextId.current++), colour: pick(SUPER_COLOURS), pattern: pickPattern() });
      }
      if (seeds.length > 0) setFishArray((prev) => [...prev, ...seeds]);
    } else if (type === 'slowmo') {
      slowmoEndRef.current = now + 6000;
    }
    spawnPowerUpNotif(type);
  };

  const handleBadFishClick = (fishId, e) => {
    e.stopPropagation();
    if (!badFishRef.current.find((f) => f.id === fishId) || phase !== 'running') return;
    frenzyEndRef.current = 0;
    frenzyCleanedRef.current = true;
    clearInterval(frenzySpawnRef.current);
    clearTimeout(badFishTimerRef.current);
    badFishRef.current = []; setBadFish([]);
    setFishArray((prev) => prev.map((f) => ({
      ...f, swimOff: true, justSpawned: false, speedMult: FISH_SCATTER_SPEED, angle: nearestEdgeAngle(f.x, f.y),
    })));
    clearTimeout(fishRespawnTimerRef.current);
    fishRespawnTimerRef.current = setTimeout(() => {
      setFishArray(Array.from({ length: initialFishCount.current }, () => createOffscreenFish(nextId.current++)));
    }, 3000);
    setScreenFlash('bad');
    setTimeout(() => setScreenFlash(null), 700);
    spawnPowerUpNotif('bad');
  };

  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX != null && clientY != null) {
      cursorRef.current = { x: clientX, y: clientY };
      setCursorPos({ x: clientX, y: clientY });
    }
    const fishObj = fishArray.find((f) => f.id === fishId);
    if (!fishObj) return;
    const { colour, pattern } = fishObj;

    // Determine tier
    const isSuper  = SUPER_COLOURS.includes(colour);
    const isRare   = !isSuper && RARE_COLOURS.includes(colour);

    // Update quota counts
    if (isSuper) {
      const n = caughtSuperRef.current + 1;
      caughtSuperRef.current = n;
      setCaughtSuper(n);
    } else if (isRare) {
      const n = caughtRareRef.current + 1;
      caughtRareRef.current = n;
      setCaughtRare(n);
    } else {
      const n = caughtCommonRef.current + 1;
      caughtCommonRef.current = n;
      setCaughtCommon(n);
    }
    totalFishRef.current++;

    // Score notification
    let points = isSuper ? 200 : isRare ? 50 : 10;
    if (fishObj.speedFish) points = Math.floor(points * 3);
    if (Date.now() < multiplierEndRef.current) points *= 2;

    const notifId = nextNotif.current++;
    const { x: curX, y: curY } = cursorRef.current;
    const notifRarity = fishObj.speedFish ? 'speed' : isSuper ? 'super' : isRare ? 'rare' : 'common';
    setScoreNotifs((prev) => [...prev, { id: notifId, x: curX, y: curY, points, rarity: notifRarity }]);
    setTimeout(() => setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId)), 1000);

    setFishArray((prev) => [...prev.filter((f) => f.id !== fishId), createMaybeFastFish(nextId.current++)]);
    const key = `${colour} ${pattern}`;
    setCaughtRecords((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setCatchAnimations((prev) => [...prev, { id: fishId, startX: curX, startY: curY, colour, pattern }]);

    // Check quota completion (after updating refs)
    const quota = getLevelQuota(levelRef.current);
    if (
      caughtCommonRef.current >= quota.common &&
      caughtRareRef.current   >= quota.rare   &&
      caughtSuperRef.current  >= quota.super
    ) {
      triggerLevelUp();
    }
  };

  const handleCatchAnimationEnd = (animId) =>
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));

  const handleSubmitScore = async () => {
    if (submitting || scoreSubmitted) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitScore({
        playerName,
        score:       levelRef.current,
        sessionId:   sessionToken.current,
        gameMode:    'quota',
        records:     caughtRecords,
        pointsScore: totalFishRef.current,
      });
      setScoreSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (phase !== 'gameover') return;
    setMenuVisible(false);
    const t = setTimeout(() => setMenuVisible(true), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'gameover') return;
    const saved = JSON.parse(localStorage.getItem('quotaHighScore') || 'null') || { level: 0, fish: 0, records: {} };
    if (levelRef.current > saved.level || (levelRef.current === saved.level && totalFishRef.current > saved.fish)) {
      localStorage.setItem('quotaHighScore', JSON.stringify({ level: levelRef.current, fish: totalFishRef.current, records: caughtRecords }));
    }
  }, [phase, caughtRecords]);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  if (phase === 'countdown') {
    return (
      <div className="container">
        <FishField count={0} isInteractive={false} isMobile={isMobile} />
        <div className="trial-countdown-container">
          <div className="trial-countdown-number">{displayNumber > 0 ? displayNumber : 'Go!'}</div>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const entries          = Object.entries(caughtRecords);
    const superRareEntries = entries.filter(([t]) => SUPER_COLOURS.includes(t.split(' ')[0]));
    const rareEntries      = entries.filter(([t]) => RARE_COLOURS.includes(t.split(' ')[0]));
    const commonEntries    = entries.filter(([t]) =>
      !SUPER_COLOURS.includes(t.split(' ')[0]) && !RARE_COLOURS.includes(t.split(' ')[0])
    );
    const renderEntry = ([typeStr, cnt]) => {
      const [colour, pattern] = typeStr.split(' ');
      return (
        <li key={typeStr} className="stats-item">
          <div className="mini-fish-container">
            <Fish x={0} y={0} size={40} colour={colour} pattern={pattern} angle={0} speed={1} isDead={false} isMobile={false} />
          </div>
          <span className="stat-fish-type">{typeStr}</span>
          <span className="stat-count">{cnt}</span>
        </li>
      );
    };
    return (
      <div className="container">
        <FishField count={0} isInteractive={false} isMobile={isMobile} />
        <div className="trial-gameover-overlay">
          <div className="trial-gameover-content">
            {gameOverView === 'summary' ? (
              <div className="gameover-summary">
                <h2 className="gameover-title">Time's Up!</h2>
                <div className="ts-gameover-stats">
                  <div className="ts-stat-block">
                    <span className="ts-stat-number">{levelRef.current}</span>
                    <span className="ts-stat-label">LEVEL</span>
                  </div>
                  <div className="ts-stat-divider" />
                  <div className="ts-stat-block">
                    <span className="ts-stat-number">{totalFishRef.current}</span>
                    <span className="ts-stat-label">FISH</span>
                  </div>
                </div>
                {menuVisible && leaderboardEnabled && (
                  <div className="gameover-submit">
                    <input
                      className="gameover-name-input"
                      placeholder="Your name"
                      maxLength={20}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      disabled={scoreSubmitted}
                    />
                    <button
                      className="gameover-action-btn gameover-action-primary"
                      onClick={handleSubmitScore}
                      disabled={scoreSubmitted || submitting}
                    >
                      {submitting ? 'Submitting…' : scoreSubmitted ? '✓ Submitted!' : 'Submit Score'}
                    </button>
                    {submitError && <p className="gameover-submit-error">{submitError}</p>}
                  </div>
                )}
                {menuVisible && (
                  <div className="gameover-actions">
                    <button className="gameover-action-btn" onClick={() => setGameOverView('catches')}>
                      🐟 Fish Caught
                    </button>
                    <button className="gameover-action-btn gameover-action-primary" onClick={onPlayAgain}>
                      ▶ Play Again
                    </button>
                    {onGoHighScore && (
                      <button className="gameover-action-btn" onClick={onGoHighScore}>
                        🏆 Leaderboard
                      </button>
                    )}
                  </div>
                )}
                {menuVisible && (
                  <button className="gameover-home-link" onClick={onBackToHome}>Back to Home</button>
                )}
              </div>
            ) : (
              <>
                <button className="gameover-back-btn" onClick={() => setGameOverView('summary')}>← Back</button>
                <h2>Fish Caught</h2>
                <div className="trial-gameover-content-inner">
                  {superRareEntries.length > 0 && (
                    <div className="stats-section"><h3><strong>Super Rare</strong></h3>
                      <ul>{superRareEntries.sort((a, b) => a[0].localeCompare(b[0])).map(renderEntry)}</ul>
                    </div>
                  )}
                  {rareEntries.length > 0 && (
                    <div className="stats-section"><h3><strong>Rare</strong></h3>
                      <ul>{rareEntries.sort((a, b) => a[0].localeCompare(b[0])).map(renderEntry)}</ul>
                    </div>
                  )}
                  {commonEntries.length > 0 && (
                    <div className="stats-section"><h3>Common</h3>
                      <ul>{commonEntries.sort((a, b) => a[0].localeCompare(b[0])).map(renderEntry)}</ul>
                    </div>
                  )}
                  {entries.length === 0 && <p className="trial-no-fish">You didn't catch any fish.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RUNNING
  const quota        = getLevelQuota(level);
  const doneCommon   = caughtCommon >= quota.common;
  const doneRare     = caughtRare   >= quota.rare;
  const doneSuper    = caughtSuper  >= quota.super;

  return (
    <div className="container" onPointerDown={handlePointerDown}>
      {showQuitConfirm && (
        <div className="quit-confirm-overlay">
          <div className="quit-confirm-box">
            <p className="quit-confirm-text">Quit the game?</p>
            <div className="quit-confirm-actions">
              <button className="quit-confirm-btn quit-confirm-yes" onClick={onBackToHome}>Quit</button>
              <button className="quit-confirm-btn quit-confirm-no" onClick={() => setShowQuitConfirm(false)}>Keep Playing</button>
            </div>
          </div>
        </div>
      )}

      {levelUpFlash && <div className="ts-levelup-flash" />}

      {/* Level complete screen (non-interactive, auto-dismisses) */}
      {showLevelComplete && completedLevel && (
        <div className="quota-level-complete">
          <div className="quota-level-complete-inner">
            <div className="quota-level-complete-check">✓</div>
            <div className="quota-level-complete-title">Level {completedLevel} Complete!</div>
            <p className="quota-level-complete-sub">Get ready for Level {completedLevel + 1}…</p>
          </div>
        </div>
      )}

      {/* Level intro card */}
      {showLevelCard && levelCardQuota && (
        <div className="quota-level-card" onPointerDown={dismissLevelCard}>
          <div className="quota-level-card-inner">
            <div className="quota-level-card-title">Level {level}</div>
            <p className="quota-level-card-subtitle">Catch before time runs out:</p>
            <ul className="quota-level-card-list">
              <li className="quota-card-row quota-card-common">
                <span className="quota-card-icon">🐟</span>
                <span>{levelCardQuota.common} Common fish</span>
              </li>
              {levelCardQuota.rare > 0 && (
                <li className="quota-card-row quota-card-rare">
                  <span className="quota-card-icon">✨</span>
                  <span>{levelCardQuota.rare} Rare fish <span className="quota-card-hint">(shimmering)</span></span>
                </li>
              )}
              {levelCardQuota.super > 0 && (
                <li className="quota-card-row quota-card-super">
                  <span className="quota-card-icon">🌟</span>
                  <span>{levelCardQuota.super} Super Rare fish <span className="quota-card-hint">(glowing)</span></span>
                </li>
              )}
            </ul>
            <p className="quota-level-card-time">{getLevelTime(level)}s on the clock</p>
            <p className="quota-level-card-tap">Tap to start</p>
          </div>
        </div>
      )}

      {effectsDisplay.frenzy     > 0 && <div className="powerup-vignette powerup-vignette-frenzy" />}
      {effectsDisplay.multiplier > 0 && <div className="powerup-vignette powerup-vignette-multiplier" />}
      {effectsDisplay.slowmo     > 0 && <div className="powerup-vignette powerup-vignette-slowmo" />}
      {screenFlash && <div className={`screen-flash screen-flash-${screenFlash}`} />}

      {scoreNotifs.map((n) => (
        <span key={n.id} className={`score-notif score-notif-${n.rarity}`}
          style={{ left: `${n.x}px`, top: `${n.y}px` }}>
          +{n.points}
        </span>
      ))}
      {powerUpNotifs.map((n) => (
        <span key={n.id} className={`power-up-notif pup-notif-${n.type}`}
          style={{ left: `${n.x}px`, top: `${n.y}px` }}>
          {n.label}
        </span>
      ))}

      <div className="light-rays" />
      <div className="water-surface" />

      <FishDisplay
        fishArray={fishArray}
        isMobile={isMobile}
        cursorPos={cursorPos}
        isJerking={isJerking}
        isCatching={catchAnimations.length > 0}
        catchAnimations={catchAnimations}
        onFishClick={handleFishClick}
        onCatchAnimationEnd={handleCatchAnimationEnd}
        speed={speed}
      />

      {bonusFish.map((bf) => (
        <BonusFish
          key={bf.id} id={bf.id} x={bf.x} y={bf.y} type={bf.type} angle={bf.angle}
          onClick={(e) => handleBonusFishClick(bf.id, e)}
          isMobile={isMobile}
          isExpiring={Date.now() - bf.spawnedAt > BONUS_FISH_LIFESPAN - 2000}
          labelText={bf.type === 'timebonus' ? `+${TIME_BONUS_SECS}s` : undefined}
        />
      ))}

      {badFish.map((bdf) => (
        <BonusFish
          key={bdf.id} id={bdf.id} x={bdf.x} y={bdf.y} type="bad" angle={bdf.angle}
          onClick={(e) => handleBadFishClick(bdf.id, e)}
          isMobile={isMobile}
          isExpiring={false}
        />
      ))}

      {/* Top HUD */}
      <div className="quota-top-hud">
        <button className="ts-quit-btn" onClick={() => setShowQuitConfirm(true)}>Quit</button>
        <div className="quota-hud-level">LVL {level}</div>
        <div className={`quota-hud-timer${timeLeft <= TIME_URGENT_SECS ? ' quota-hud-timer-urgent' : ''}`}>{timeLeft}s</div>
        <div className="quota-hud-items">
          <span className={`quota-item${doneCommon ? ' quota-item-done' : ''}`}>
            {doneCommon ? '✓ Common' : `Common ${caughtCommon}/${quota.common}`}
          </span>
          {quota.rare > 0 && (
            <span className={`quota-item quota-item-rare${doneRare ? ' quota-item-done' : ''}`}>
              {doneRare ? '✓ Rare' : `Rare ${caughtRare}/${quota.rare}`}
            </span>
          )}
          {quota.super > 0 && (
            <span className={`quota-item quota-item-super${doneSuper ? ' quota-item-done' : ''}`}>
              {doneSuper ? '✓ Super' : `Super ${caughtSuper}/${quota.super}`}
            </span>
          )}
        </div>
      </div>

      <div className="top-center-ui">
        <div className="score-display">Fish: {totalFishRef.current}</div>
      </div>

      <div className="power-up-hud">
        {effectsDisplay.frenzy > 0 && <div className="pup-pill pup-frenzy">💥 FRENZY {effectsDisplay.frenzy}s</div>}
        {effectsDisplay.slowmo > 0 && <div className="pup-pill pup-slowmo">❄ SLOW {effectsDisplay.slowmo}s</div>}
      </div>
    </div>
  );
}
