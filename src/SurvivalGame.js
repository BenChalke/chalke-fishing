// src/SurvivalGame.js

import React, { useState, useEffect, useRef } from 'react';
import FishDisplay from './components/FishDisplay';
import FishField   from './components/FishField';
import Fish        from './components/Fish';
import BonusFish   from './components/BonusFish';

import { RARE_COLOURS, SUPER_COLOURS } from './constants/fishConstants';
import {
  createRandomFish,
  createOffscreenFish,
  FISH_SIZE,
  viewportFishCount,
  ENTRY_MULT,
} from './utils/fishUtils';

import { leaderboardEnabled, submitScore } from './utils/leaderboard';
import './SurvivalGame.css';
import './components/StatsPopup.css';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Tuning ────────────────────────────────────────────────────────────────────
const BASE_SPEED              = 3.5;
const SPEED_ESCALATION_MS     = 20000;
const SPEED_ESCALATION_AMT    = 0.35;
const SPEED_CAP               = 9.0;

const BONUS_FISH_SIZE         = 150;
const BONUS_FISH_LIFESPAN     = 8000;
const SPEED_FISH_CHANCE       = 0.12;
const SPEED_FISH_LIFESPAN     = 12000;

const DESKTOP_TICK            = 30;
const MOBILE_TICK             = 30;

const BAD_FISH_COUNT_DESKTOP  = 2;
const BAD_FISH_COUNT_MOBILE   = 1;
const BAD_FISH_MAX_DESKTOP    = 6;
const BAD_FISH_MAX_MOBILE     = 3;
const BAD_FISH_ESCALATION_MS  = 30000; // add 1 bad fish every 30s
const BAD_FISH_SPEED_MULT     = 3.5;
const BAD_FISH_TURN_MIN       = 1200;
const BAD_FISH_TURN_MAX       = 2800;

const FRENZY_FISH_MULT        = 3.5;
const DESKTOP_FRENZY_INT      = 150;
const MOBILE_FRENZY_INT       = 400;
const FRENZY_SPEED_MULT       = 1.75;
const MOBILE_FRENZY_SPEED_MULT = 1.6;
const FRENZY_EXTRA_BAD        = 2;
const FISH_SCATTER_SPEED      = 12;

const CATCH_QUOTA_SECS        = 10; // seconds to catch a fish before game over

const COMBO_THRESHOLDS = [
  { min: 12, mult: 5 },
  { min: 8,  mult: 4 },
  { min: 5,  mult: 3 },
  { min: 3,  mult: 2 },
];

function getComboMult(combo) {
  for (const { min, mult } of COMBO_THRESHOLDS) {
    if (combo >= min) return mult;
  }
  return 1;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function nearestEdgeAngle(x, y, fishSize = FISH_SIZE) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cx = x + fishSize / 2;
  const cy = y + fishSize * 0.25;
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
  const w          = window.innerWidth;
  const h          = window.innerHeight;
  const fishHeight = fishSize * 0.5;
  const { x, y, angle } = fish;
  const now        = Date.now();
  const frenzyMult = frenzyEndTs > 0 && now < frenzyEndTs
    ? (isMobile ? MOBILE_FRENZY_SPEED_MULT : FRENZY_SPEED_MULT) : 1;
  const effSpeed   = speed * fish.speedMult * (now < slowmoEndTs ? 0.35 : 1) * frenzyMult;

  if (fish.swimOff) {
    const nx = x + Math.cos(angle) * effSpeed;
    const ny = y + Math.sin(angle) * effSpeed;
    return { ...fish, x: nx, y: ny,
      remove: nx + fishSize < 0 || nx > w || ny + fishHeight < 0 || ny > h };
  }

  if (fish.justSpawned) {
    const cx = x + fishSize / 2;
    const cy = y + fishHeight / 2;
    const at = Math.atan2(h / 2 - cy, w / 2 - cx);
    const nx = x + Math.cos(at) * effSpeed;
    const ny = y + Math.sin(at) * effSpeed;
    const inside = nx >= 0 && nx + fishSize <= w && ny >= 0 && ny + fishHeight <= h;
    const entryAngle = inside ? at + (Math.random() - 0.5) * (Math.PI * 0.75) : at;
    return { ...fish, x: nx, y: ny, angle: entryAngle, justSpawned: !inside,
             speedMult: inside ? (fish.postEntrySpeedMult ?? 1) : ENTRY_MULT };
  }

  const nx = x + Math.cos(angle) * effSpeed;
  const ny = y + Math.sin(angle) * effSpeed;
  if (nx + fishSize < 0 || nx > w || ny + fishHeight < 0 || ny > h) {
    return { ...fish, x: nx, y: ny, remove: true };
  }
  return { ...fish, x: nx, y: ny };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SurvivalGame({ onBackToHome, onPlayAgain }) {
  // ── Phase ──
  const [phase, setPhase]                 = useState('countdown');
  const [displayNumber, setDisplayNumber] = useState(3);

  // ── Fish / score ──
  const [fishArray, setFishArray]             = useState([]);
  const [speed, setSpeed]                     = useState(BASE_SPEED);
  const [cursorPos, setCursorPos]             = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking]             = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords]     = useState({});
  const [score, setScore]                     = useState(0);
  const [isMobile, setIsMobile]               = useState(false);
  const [scoreNotifs, setScoreNotifs]         = useState([]);
  const [timeSurvived, setTimeSurvived]       = useState(0);
  const [catchTimer, setCatchTimer]           = useState(CATCH_QUOTA_SECS);
  const [deathReason, setDeathReason]         = useState('');
  const [comboCount, setComboCount]           = useState(0);

  // ── UI ──
  const [gameOverView, setGameOverView]       = useState('summary');
  const [menuVisible, setMenuVisible]         = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // ── Leaderboard submit ──
  const [playerName, setPlayerName]         = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError]       = useState('');
  const sessionToken                        = useRef(generateUUID());

  // ── Power-ups ──
  const [bonusFish, setBonusFish]           = useState([]);
  const [badFish, setBadFish]               = useState([]);
  const [effectsDisplay, setEffectsDisplay] = useState({ frenzy: 0, multiplier: 0, slowmo: 0 });
  const [powerUpNotifs, setPowerUpNotifs]   = useState([]);
  const [screenFlash, setScreenFlash]       = useState(null);

  // ── Refs ──
  const nextNotif           = useRef(0);
  const cursorRef           = useRef({ x: -1000, y: -1000 });
  const nextId              = useRef(FISH_SIZE);
  const speedRef            = useRef(BASE_SPEED);
  const isMobileRef         = useRef(false);
  const initialFishCount    = useRef(0);
  const baseBadCount        = useRef(BAD_FISH_COUNT_DESKTOP);
  const frenzyEndRef        = useRef(0);
  const multiplierEndRef    = useRef(0);
  const slowmoEndRef        = useRef(0);
  const frenzySpawnRef      = useRef(null);
  const frenzyCleanedRef    = useRef(true);
  const bonusFishRef        = useRef([]);
  const bonusSpawnTimerRef  = useRef(null);
  const badFishRef          = useRef([]);
  const frenzyBadRef        = useRef([]);
  const speedEscalationRef  = useRef(null);
  const badEscalationRef    = useRef(null);
  const maxBadRef           = useRef(BAD_FISH_MAX_DESKTOP);
  const catchTimerRef       = useRef(CATCH_QUOTA_SECS);
  const comboRef            = useRef(0);
  const gameOverRef         = useRef(false);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  // ── Mount ──
  useEffect(() => {
    const mobile = 'ontouchstart' in window;
    isMobileRef.current = mobile;
    setIsMobile(mobile);
    baseBadCount.current = mobile ? BAD_FISH_COUNT_MOBILE : BAD_FISH_COUNT_DESKTOP;
    maxBadRef.current    = mobile ? BAD_FISH_MAX_MOBILE   : BAD_FISH_MAX_DESKTOP;
    const count = viewportFishCount();
    initialFishCount.current = count;
    setFishArray(Array.from({ length: count }, (_, i) => createRandomFish(i)));
  }, []);

  // ── Cursor track ──
  useEffect(() => {
    let pendingRAF = null;
    const onMove = (e) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (!pendingRAF) {
        pendingRAF = requestAnimationFrame(() => {
          setCursorPos({ ...cursorRef.current });
          pendingRAF = null;
        });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (pendingRAF) cancelAnimationFrame(pendingRAF);
    };
  }, []);

  const handlePointerDown = (e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    cursorRef.current = { x: clientX, y: clientY };
    setCursorPos({ x: clientX, y: clientY });
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);

    // Empty water click — reset combo (not during frenzy)
    const inFrenzy = frenzyEndRef.current > 0 && Date.now() < frenzyEndRef.current;
    if (phase === 'running' && comboRef.current > 0 && !inFrenzy) {
      comboRef.current = 0;
      setComboCount(0);
      const id = nextNotif.current++;
      setPowerUpNotifs((prev) => [...prev, {
        id, type: 'combo-reset', label: 'MISS!',
        x: clientX, y: clientY,
      }]);
      setTimeout(() => setPowerUpNotifs((prev) => prev.filter((n) => n.id !== id)), 900);
    }
  };

  // ── Countdown ──
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

  const spawnInitialBadFish = (count) => {
    const now = Date.now();
    const fish = Array.from({ length: count }, () => ({
      ...createOffscreenFish(nextId.current++),
      type: 'bad',
      postEntrySpeedMult: BAD_FISH_SPEED_MULT,
      nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN),
    }));
    badFishRef.current = fish;
    setBadFish(fish);
  };

  const spawnPowerUpNotif = (type) => {
    const labels = { frenzy: 'FRENZY!', multiplier: 'x2!', slowmo: 'SLOW!' };
    const id = nextNotif.current++;
    setPowerUpNotifs((prev) => [...prev, {
      id, type, label: labels[type] || '!',
      x: window.innerWidth / 2, y: window.innerHeight / 2,
    }]);
    setTimeout(() => setPowerUpNotifs((prev) => prev.filter((n) => n.id !== id)), 1500);
  };

  const triggerGameOver = (reason = '') => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    badFishRef.current = [];
    frenzyBadRef.current = [];
    setBadFish([]);
    comboRef.current = 0;
    setDeathReason(reason);
    setPhase('gameover');
  };

  // ── Running phase ──
  useEffect(() => {
    if (phase !== 'running') return;
    gameOverRef.current = false;
    catchTimerRef.current = CATCH_QUOTA_SECS;
    comboRef.current = 0;

    const mobile    = isMobileRef.current;
    const TICK_MS   = mobile ? MOBILE_TICK : DESKTOP_TICK;
    const target    = initialFishCount.current;

    spawnInitialBadFish(baseBadCount.current);

    const scheduleBonusSpawn = (isFirst = false) => {
      const delay = isFirst ? 3000 + Math.random() * 4000 : 8000 + Math.random() * 5000;
      bonusSpawnTimerRef.current = setTimeout(() => {
        const types = ['frenzy', 'multiplier', 'slowmo'];
        const type  = types[Math.floor(Math.random() * types.length)];
        const fish  = {
          ...createOffscreenFish(nextId.current++),
          type, spawnedAt: Date.now(), postEntrySpeedMult: 1.3,
        };
        bonusFishRef.current = [...bonusFishRef.current, fish];
        setBonusFish([...bonusFishRef.current]);
        scheduleBonusSpawn(false);
      }, delay);
    };
    scheduleBonusSpawn(true);

    speedEscalationRef.current = setInterval(() => {
      setSpeed((s) => {
        const next = Math.min(SPEED_CAP, parseFloat((s + SPEED_ESCALATION_AMT).toFixed(2)));
        speedRef.current = next;
        return next;
      });
    }, SPEED_ESCALATION_MS);

    badEscalationRef.current = setInterval(() => {
      if (gameOverRef.current) return;
      const currentCount = badFishRef.current.length + frenzyBadRef.current.length;
      if (currentCount >= maxBadRef.current) return;
      const now = Date.now();
      const newFish = {
        ...createOffscreenFish(nextId.current++),
        type: 'bad',
        postEntrySpeedMult: BAD_FISH_SPEED_MULT,
        nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN),
      };
      badFishRef.current = [...badFishRef.current, newFish];
      setBadFish([...badFishRef.current, ...frenzyBadRef.current]);
    }, BAD_FISH_ESCALATION_MS);

    const fishInterval = setInterval(() => {
      if (gameOverRef.current) return;
      const now        = Date.now();
      const frenzyDone = frenzyEndRef.current > 0 && now > frenzyEndRef.current;
      const doCleanup  = frenzyDone && !frenzyCleanedRef.current;
      if (doCleanup) frenzyCleanedRef.current = true;

      setFishArray((prev) => {
        let result = prev.map((f) =>
          moveSingleFish(f, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, frenzyEndRef.current)
        );
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
            if (now - bf.spawnedAt > BONUS_FISH_LIFESPAN && !bf.swimOff) {
              return { ...bf, swimOff: true, angle: nearestEdgeAngle(bf.x, bf.y, BONUS_FISH_SIZE) };
            }
            return moveSingleFish(bf, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, 0, BONUS_FISH_SIZE);
          })
          .filter((bf) => !bf.remove);
        bonusFishRef.current = updated;
        setBonusFish(updated);
      }

      const moveBadFish = (arr) => arr.map((bdf) => {
        let fish = bdf;
        if (!fish.justSpawned && now > fish.nextTurnAt) {
          fish = { ...fish, angle: Math.random() * 2 * Math.PI,
            nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN) };
        }
        const moved = moveSingleFish(fish, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, 0, BONUS_FISH_SIZE);
        if (moved.remove) {
          return {
            ...createOffscreenFish(nextId.current++),
            type: 'bad',
            postEntrySpeedMult: BAD_FISH_SPEED_MULT,
            nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN),
          };
        }
        return moved;
      });

      if (badFishRef.current.length > 0) {
        const updated = moveBadFish(badFishRef.current);
        badFishRef.current = updated;
        setBadFish(updated);
      }

      if (frenzyBadRef.current.length > 0) {
        if (doCleanup) {
          frenzyBadRef.current = [];
        } else {
          frenzyBadRef.current = moveBadFish(frenzyBadRef.current);
        }
        setBadFish([...badFishRef.current, ...frenzyBadRef.current]);
      }
    }, TICK_MS);

    // 1 s interval: survive timer + catch quota
    const timeInterval = setInterval(() => {
      if (gameOverRef.current) return;
      const now = Date.now();

      setEffectsDisplay({
        frenzy:     Math.max(0, Math.round((frenzyEndRef.current    - now) / 1000)),
        multiplier: Math.max(0, Math.round((multiplierEndRef.current - now) / 1000)),
        slowmo:     Math.max(0, Math.round((slowmoEndRef.current    - now) / 1000)),
      });

      setTimeSurvived((t) => t + 1);

      // Catch quota countdown — always ticks in survival (slowmo only slows fish)
      catchTimerRef.current -= 1;
      if (catchTimerRef.current <= 0) {
        triggerGameOver('Too slow! You didn\'t catch a fish in time.');
      } else {
        setCatchTimer(catchTimerRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(fishInterval);
      clearInterval(timeInterval);
      clearTimeout(bonusSpawnTimerRef.current);
      clearInterval(frenzySpawnRef.current);
      clearInterval(speedEscalationRef.current);
      clearInterval(badEscalationRef.current);
    };
  }, [phase]); // eslint-disable-line

  // ── Bonus fish click ──
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

    // Catching a power-up counts as keeping the quota alive
    catchTimerRef.current = CATCH_QUOTA_SECS;
    setCatchTimer(CATCH_QUOTA_SECS);

    if (type === 'frenzy') {
      frenzyEndRef.current     = now + 10000;
      frenzyCleanedRef.current = false;
      clearInterval(frenzySpawnRef.current);
      frenzySpawnRef.current = setInterval(() => {
        if (Date.now() > frenzyEndRef.current) { clearInterval(frenzySpawnRef.current); return; }
        setFishArray((prev) => {
          if (prev.length >= Math.round(initialFishCount.current * FRENZY_FISH_MULT)) return prev;
          return [...prev, createOffscreenFish(nextId.current++)];
        });
      }, mobile ? MOBILE_FRENZY_INT : DESKTOP_FRENZY_INT);

      const extraCount = mobile ? 1 : FRENZY_EXTRA_BAD;
      const extraBad = Array.from({ length: extraCount }, () => ({
        ...createOffscreenFish(nextId.current++),
        type: 'bad',
        postEntrySpeedMult: BAD_FISH_SPEED_MULT,
        nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN),
      }));
      frenzyBadRef.current = extraBad;
      setBadFish([...badFishRef.current, ...extraBad]);
    } else if (type === 'multiplier') {
      multiplierEndRef.current = now + 8000;
    } else if (type === 'slowmo') {
      slowmoEndRef.current = now + 6000;
    }

    spawnPowerUpNotif(type);
  };

  // ── Bad fish click — game over ──
  const handleBadFishClick = (fishId, e) => {
    e.stopPropagation();
    if (phase !== 'running') return;
    const allBad = [...badFishRef.current, ...frenzyBadRef.current];
    if (!allBad.find((f) => f.id === fishId)) return;

    clearInterval(frenzySpawnRef.current);
    clearTimeout(bonusSpawnTimerRef.current);
    clearInterval(speedEscalationRef.current);
    clearInterval(badEscalationRef.current);

    setScreenFlash('bad');
    setTimeout(() => setScreenFlash(null), 700);
    triggerGameOver('You clicked a skull fish!');
  };

  // ── Regular fish click ──
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

    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    setComboCount(newCombo);

    let points = 10;
    if (SUPER_COLOURS.includes(colour))     points = 200;
    else if (RARE_COLOURS.includes(colour)) points = 50;
    if (fishObj.speedFish) points = Math.floor(points * 3);
    points = Math.round(points * getComboMult(newCombo));
    if (Date.now() < multiplierEndRef.current) points *= 2;

    setScore((prev) => prev + points);

    const notifId = nextNotif.current++;
    const { x: curX, y: curY } = cursorRef.current;
    let notifRarity = fishObj.speedFish ? 'speed' : 'common';
    if (!fishObj.speedFish && SUPER_COLOURS.includes(colour))     notifRarity = 'super';
    else if (!fishObj.speedFish && RARE_COLOURS.includes(colour)) notifRarity = 'rare';
    setScoreNotifs((prev) => [...prev, { id: notifId, x: curX, y: curY, points, rarity: notifRarity }]);
    setTimeout(() => setScoreNotifs((prev) => prev.filter((n) => n.id !== notifId)), 1000);

    setFishArray((prev) => [...prev.filter((f) => f.id !== fishId), createMaybeFastFish(nextId.current++)]);

    const key = `${colour} ${pattern}`;
    setCaughtRecords((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setCatchAnimations((prev) => [...prev, { id: fishId, startX: curX, startY: curY, colour, pattern }]);

    // Reset catch quota timer
    catchTimerRef.current = CATCH_QUOTA_SECS;
    setCatchTimer(CATCH_QUOTA_SECS);
  };

  const handleCatchAnimationEnd = (animId) =>
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));

  // ── Submit to global leaderboard ──
  const handleSubmitScore = async () => {
    if (submitting || scoreSubmitted) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitScore({
        playerName,
        score: timeSurvived,   // ranking metric: seconds survived
        sessionId: sessionToken.current,
        gameMode: 'survival',
        records: caughtRecords,
        pointsScore: score,    // fish points, for display
      });
      setScoreSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Game over: save high score ──
  useEffect(() => {
    if (phase !== 'gameover') return;
    setMenuVisible(false);
    const t = setTimeout(() => setMenuVisible(true), 2500);

    const saved = JSON.parse(localStorage.getItem('survivalHighScore')) || { time: 0, score: 0, records: {} };
    if (timeSurvived > saved.time || (timeSurvived === saved.time && score > saved.score)) {
      localStorage.setItem('survivalHighScore', JSON.stringify({ time: timeSurvived, score, records: caughtRecords }));
    }
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

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

    const mins    = Math.floor(timeSurvived / 60);
    const secs    = timeSurvived % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return (
      <div className="container">
        <FishField count={0} isInteractive={false} isMobile={isMobile} />
        <div className="trial-gameover-overlay">
          <div className="trial-gameover-content">
            {gameOverView === 'summary' ? (
              <div className="gameover-summary">
                <h2 className="gameover-title survival-gameover-title">You died!</h2>
                {deathReason && <p className="survival-death-reason">{deathReason}</p>}
                <div className="survival-stats-block">
                  <div className="survival-stat">
                    <span className="survival-stat-number">{timeStr}</span>
                    <span className="survival-stat-label">SURVIVED</span>
                  </div>
                  <div className="survival-stat-divider" />
                  <div className="survival-stat">
                    <span className="survival-stat-number survival-stat-score">{score}</span>
                    <span className="survival-stat-label">POINTS</span>
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
                      Fish Caught
                    </button>
                    <button className="gameover-action-btn gameover-action-primary" onClick={onPlayAgain}>
                      ▶ Play Again
                    </button>
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
  const allBadFish      = [...badFish];
  const quotaPct        = (catchTimer / CATCH_QUOTA_SECS) * 100;
  const quotaUrgent     = catchTimer <= 3;
  const quotaWarning    = catchTimer <= 5 && catchTimer > 3;

  return (
    <div className="container no-cursor" onPointerDown={handlePointerDown}>
      <button className="back-home-btn" onClick={() => setShowQuitConfirm(true)}>Quit</button>

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

      <div className="survival-danger-vignette" />
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
        <BonusFish key={bf.id} id={bf.id} x={bf.x} y={bf.y} type={bf.type} angle={bf.angle}
          onClick={(e) => handleBonusFishClick(bf.id, e)} isMobile={isMobile}
          isExpiring={Date.now() - bf.spawnedAt > BONUS_FISH_LIFESPAN - 2000} />
      ))}

      {allBadFish.map((bdf) => (
        <BonusFish key={bdf.id} id={bdf.id} x={bdf.x} y={bdf.y} type="bad" angle={bdf.angle}
          onClick={(e) => handleBadFishClick(bdf.id, e)} isMobile={isMobile} isExpiring={false} />
      ))}

      <div className="time-left-display survival-timer">
        {Math.floor(timeSurvived / 60) > 0
          ? `${Math.floor(timeSurvived / 60)}m ${timeSurvived % 60}s`
          : `${timeSurvived}s`}
      </div>

      <div className="top-center-ui">
        <div className="score-display">Score: {score}</div>
      </div>

      <div className="survival-bad-count">
        ☠ {allBadFish.length}
      </div>

      {/* Catch quota bar — top of screen */}
      <div className="catch-quota-top">
        <div className="catch-quota-top-track">
          <div
            className={`catch-quota-top-fill ${quotaUrgent ? 'catch-quota-urgent' : quotaWarning ? 'catch-quota-warning' : ''}`}
            style={{ width: `${quotaPct}%` }}
          />
        </div>
        <div className={`catch-quota-top-label ${quotaUrgent ? 'catch-quota-urgent-text' : quotaWarning ? 'catch-quota-warning-text' : ''}`}>
          {quotaUrgent ? `CATCH! ${catchTimer}s` : `${catchTimer}s`}
        </div>
      </div>

      {/* Combo multiplier background watermark */}
      {comboCount >= 3 && (
        <div className={`combo-bg-watermark combo-bg-x${getComboMult(comboCount)}`}>
          x{getComboMult(comboCount)}
        </div>
      )}

      <div className="power-up-hud">
        {comboCount >= 3 && (
          <div className={`pup-pill pup-combo pup-combo-x${getComboMult(comboCount)}`}>
            🔥 x{getComboMult(comboCount)} ({comboCount})
          </div>
        )}
        {effectsDisplay.frenzy     > 0 && <div className="pup-pill pup-frenzy">💥 FRENZY {effectsDisplay.frenzy}s</div>}
        {effectsDisplay.multiplier > 0 && <div className="pup-pill pup-multiplier">⚡ x2 {effectsDisplay.multiplier}s</div>}
        {effectsDisplay.slowmo     > 0 && <div className="pup-pill pup-slowmo">❄ SLOW {effectsDisplay.slowmo}s</div>}
      </div>
    </div>
  );
}
