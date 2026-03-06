// src/TimeTrialGame.js

import React, { useState, useEffect, useRef } from 'react';
import FishDisplay    from './components/FishDisplay';
import FishField      from './components/FishField';
import Hook           from './components/Hook';
import Fish           from './components/Fish';
import BonusFish      from './components/BonusFish';

import {
  RARE_COLOURS,
  SUPER_COLOURS,
} from './constants/fishConstants';

import {
  createRandomFish,
  createOffscreenFish,
  FISH_SIZE,
  viewportFishCount,
  ENTRY_MULT,
} from './utils/fishUtils';

import { leaderboardEnabled, submitScore } from './utils/leaderboard';
import './TimeTrialGame.css';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Tuning constants ─────────────────────────────────────────────────────────
const MIN_SPEED           = 0.5;
const MAX_SPEED           = 20.0;
const TOTAL_TIME          = 60;
const BONUS_FISH_SIZE     = 150;
const BONUS_FISH_LIFESPAN = 8000;
const SPEED_FISH_CHANCE   = 0.12;
const SPEED_FISH_LIFESPAN = 12000;

// Mobile gets slower ticks and a lower frenzy cap; fish count is viewport-based

const DESKTOP_TICK          = 30;  // ms between movement updates
const MOBILE_TICK           = 30;
const FRENZY_FISH_MULT      = 2.5; // frenzy spawns up to this multiple of the base fish count
const DESKTOP_FRENZY_INT    = 150; // ms between frenzy spawns
const MOBILE_FRENZY_INT     = 400;
const FRENZY_SPEED_MULT        = 2.2; // speed multiplier for regular fish during frenzy (desktop)
const MOBILE_FRENZY_SPEED_MULT = 2.0; // slightly slower on mobile for manageability
const BAD_FISH_SPAWN_DELAY  = 2500; // ms after frenzy starts before bad fish appears
const BAD_FISH_SPEED_MULT   = 4.0; // post-entry speedMult for bad fish (faster than frenzy fish)
const BAD_FISH_TURN_MIN     = 1500; // ms min between random direction changes
const BAD_FISH_TURN_MAX     = 3000; // ms max between random direction changes
const FISH_SCATTER_SPEED    = 12;  // speedMult for scattered fish (gets off screen fast)

// ── Pure helpers (no React, no closures) ─────────────────────────────────────

/** Angle (radians) pointing from (x,y) toward the nearest screen edge. */
function nearestEdgeAngle(x, y, fishSize = FISH_SIZE) {
  const w  = window.innerWidth;
  const h  = window.innerHeight;
  const cx = x + fishSize / 2;
  const cy = y + fishSize * 0.25;
  const distances = [cx, w - cx, cy, h - cy];   // left, right, top, bottom
  const angles    = [Math.PI, 0, -Math.PI / 2, Math.PI / 2];
  return angles[distances.indexOf(Math.min(...distances))];
}

/** Possibly wrap an offscreen fish with speed-fish flags (~12% chance). */
function createMaybeFastFish(id) {
  const fish = createOffscreenFish(id);
  if (Math.random() < SPEED_FISH_CHANCE) {
    return { ...fish, speedFish: true, postEntrySpeedMult: 2.0, spawnedAt: Date.now() };
  }
  return fish;
}

/**
 * Move one fish one tick. Returns an updated fish object.
 * Returns { ...fish, remove: true } when a swimOff fish exits the screen.
 * slowmoEndTs is read as a plain number (not a ref) so it stays fresh.
 */
function moveSingleFish(fish, speed, cursor, isMobile, slowmoEndTs, frenzyEndTs = 0, fishSize = FISH_SIZE) {
  const w          = window.innerWidth;
  const h          = window.innerHeight;
  const fishHeight = fishSize * 0.5;
  const { x, y, angle, speedMult } = fish;
  const now        = Date.now();
  const frenzyMult = frenzyEndTs > 0 && now < frenzyEndTs ? (isMobile ? MOBILE_FRENZY_SPEED_MULT : FRENZY_SPEED_MULT) : 1;
  const effSpeed   = speed * speedMult * (now < slowmoEndTs ? 0.35 : 1) * frenzyMult;

  // ── SWIM-OFF: head straight for the edge, then vanish ──
  if (fish.swimOff) {
    const nx = x + Math.cos(angle) * effSpeed;
    const ny = y + Math.sin(angle) * effSpeed;
    return { ...fish, x: nx, y: ny,
      remove: nx + fishSize < 0 || nx > w || ny + fishHeight < 0 || ny > h };
  }

  // ── ENTRY: steer toward screen centre ──
  if (fish.justSpawned) {
    const cx = x + fishSize / 2;
    const cy = y + fishHeight / 2;
    const at = Math.atan2(h / 2 - cy, w / 2 - cx);
    const nx = x + Math.cos(at) * effSpeed;
    const ny = y + Math.sin(at) * effSpeed;
    const inside = nx >= 0 && nx + fishSize <= w && ny >= 0 && ny + fishHeight <= h;
    return { ...fish, x: nx, y: ny, angle: at, justSpawned: !inside,
             speedMult: inside ? (fish.postEntrySpeedMult ?? 1) : ENTRY_MULT };
  }

  // ── NORMAL ──
  let dx  = Math.cos(angle) * effSpeed;
  let dy  = Math.sin(angle) * effSpeed;
  let ang = angle;

  let nx = x + dx;
  let ny = y + dy;

  if (nx + fishSize < 0 || nx > w || ny + fishHeight < 0 || ny > h) {
    ang += Math.PI;
    nx = x + Math.cos(ang) * speed;
    ny = y + Math.sin(ang) * speed;
  }
  if (nx <= 0 || nx + fishSize >= w) { ang = Math.PI - ang; nx = x + Math.cos(ang) * speed; }
  if (ny <= 0 || ny + fishHeight >= h) { ang = -ang; ny = y + Math.sin(ang) * speed; }

  return { ...fish, x: nx, y: ny, angle: ang };
}

// ────────────────────────────────────────────────────────────────────────────

export default function TimeTrialGame({ onBackToHome, onPlayAgain, onGoHighScore }) {
  // ── Phase ──
  const [phase, setPhase]                 = useState('countdown');
  const [displayNumber, setDisplayNumber] = useState(3);
  const [timeLeft, setTimeLeft]           = useState(TOTAL_TIME);

  // ── Fish / score ──
  const [fishArray, setFishArray]         = useState([]);
  const [speed, setSpeed]                 = useState(4.0);
  const [cursorPos, setCursorPos]         = useState({ x: -1000, y: -1000 });
  const [isJerking, setIsJerking]         = useState(false);
  const [catchAnimations, setCatchAnimations] = useState([]);
  const [caughtRecords, setCaughtRecords] = useState({});
  const [score, setScore]                 = useState(0);
  const [isMobile, setIsMobile]           = useState(false);
  const [scoreNotifs, setScoreNotifs]     = useState([]);

  // ── Game over view ──
  const [gameOverView, setGameOverView] = useState('summary'); // 'summary' | 'catches'

  // ── Leaderboard submit ──
  const [playerName, setPlayerName]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitError, setSubmitError]   = useState('');
  const sessionToken                    = useRef(generateUUID());

  // ── Power-ups ──
  const [bonusFish, setBonusFish]           = useState([]);
  const [badFish, setBadFish]               = useState([]);
  const [effectsDisplay, setEffectsDisplay] = useState({ frenzy: 0, multiplier: 0, slowmo: 0 });
  const [powerUpNotifs, setPowerUpNotifs]   = useState([]);
  const [screenFlash, setScreenFlash]       = useState(null);

  // ── Refs (safe to read from RAF / intervals without stale-closure issues) ──
  const nextNotif           = useRef(0);
  const cursorRef           = useRef({ x: -1000, y: -1000 });
  const nextId              = useRef(FISH_SIZE);
  const speedRef            = useRef(4.0);        // mirrors speed state
  const isMobileRef         = useRef(false);
  const initialFishCount    = useRef(0); // set at mount based on viewport
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
  const rafRef              = useRef(null);
  const lastTickRef         = useRef(0);

  // Keep speedRef in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // ── Mount: detect mobile & create appropriate number of fish ──
  useEffect(() => {
    const mobile = 'ontouchstart' in window;
    isMobileRef.current = mobile;
    setIsMobile(mobile);
    const count = viewportFishCount();
    initialFishCount.current = count;
    setFishArray(Array.from({ length: count }, (_, i) => createRandomFish(i)));
  }, []);

  // ── Cursor track – throttled to once per animation frame ──
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

  // ── Pointer down (jerk hook) ──
  const handlePointerDown = (e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    cursorRef.current = { x: clientX, y: clientY };
    setCursorPos({ x: clientX, y: clientY });
    setIsJerking(true);
    setTimeout(() => setIsJerking(false), 300);
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

  // ── Power-up notification ──
  const spawnPowerUpNotif = (type) => {
    const labels = { frenzy: 'FRENZY!', timebonus: '+15s!', multiplier: 'x2!', slowmo: 'SLOW!', bad: '☠ SCATTER!' };
    const id = nextNotif.current++;
    setPowerUpNotifs((prev) => [...prev, {
      id, type, label: labels[type] || '!',
      x: window.innerWidth / 2, y: window.innerHeight / 2,
    }]);
    setTimeout(() => setPowerUpNotifs((prev) => prev.filter((n) => n.id !== id)), 1500);
  };

  // ── Running phase: RAF movement loop + 1 s timer ──
  // Deps: [phase] only — speed/mobile read via refs so the effect never restarts
  // mid-game (avoids resetting the bonus-fish spawn timer on speed changes).
  useEffect(() => {
    if (phase !== 'running') return;

    const mobile    = isMobileRef.current;
    const TICK_MS   = mobile ? MOBILE_TICK  : DESKTOP_TICK;
    const FRENZ_CAP = Math.round(initialFishCount.current * FRENZY_FISH_MULT);
    const FRENZ_INT = mobile ? MOBILE_FRENZY_INT  : DESKTOP_FRENZY_INT;
    const target    = initialFishCount.current; // fish count to restore after frenzy

    // Bonus fish scheduler (first spawn: 3–10 s; subsequent: 15–20 s)
    const scheduleBonusSpawn = (isFirst = false) => {
      const delay = isFirst
        ? 3000  + Math.random() * 7000
        : 15000 + Math.random() * 5000;
      bonusSpawnTimerRef.current = setTimeout(() => {
        const types = ['frenzy', 'timebonus', 'multiplier', 'slowmo'];
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

    // Movement interval — simple setInterval at TICK_MS
    const fishInterval = setInterval(() => {
      const now        = Date.now();
      const frenzyDone = frenzyEndRef.current > 0 && now > frenzyEndRef.current;
      const doCleanup  = frenzyDone && !frenzyCleanedRef.current;
      if (doCleanup) frenzyCleanedRef.current = true;

      // Regular fish
      setFishArray((prev) => {
        // 1. Move
        let result = prev.map((f) =>
          moveSingleFish(f, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, frenzyEndRef.current)
        );
        // 2. Remove fish that swam off-screen
        result = result.filter((f) => !f.remove);

        // 3. Frenzy cleanup: point excess fish to nearest edge and let them swim out
        if (doCleanup) {
          const activeNormal = result.filter((f) => !f.swimOff && !f.speedFish);
          const excess       = Math.max(0, activeNormal.length - target);
          let marked = 0;
          result = result.map((f) => {
            if (!f.swimOff && !f.speedFish && marked < excess) {
              marked++;
              return { ...f, swimOff: true, justSpawned: false, speedMult: FISH_SCATTER_SPEED, angle: nearestEdgeAngle(f.x, f.y) };
            }
            return f;
          });
        }

        // 4. Speed fish lifespan
        result = result.map((f) => {
          if (f.speedFish && !f.swimOff && f.spawnedAt && now - f.spawnedAt > SPEED_FISH_LIFESPAN) {
            return { ...f, swimOff: true, angle: nearestEdgeAngle(f.x, f.y) };
          }
          return f;
        });

        return result;
      });

      // Bonus fish (array)
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

      // Bad fish (frenzy trap) — fast, chaotic, ignores frenzy multiplier
      if (badFishRef.current.length > 0) {
        if (doCleanup) {
          badFishRef.current = [];
          setBadFish([]);
        } else {
          const updated = badFishRef.current.map((bdf) => {
            let fish = bdf;
            // Random direction changes after entry
            if (!fish.justSpawned && now > fish.nextTurnAt) {
              fish = { ...fish, angle: Math.random() * 2 * Math.PI,
                nextTurnAt: now + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN) };
            }
            return moveSingleFish(fish, speedRef.current, cursorRef.current, mobile, slowmoEndRef.current, 0, BONUS_FISH_SIZE);
          }).filter((f) => !f.remove);
          badFishRef.current = updated;
          setBadFish(updated);
        }
      }
    }, TICK_MS);

    // 1 s timer
    const timeInterval = setInterval(() => {
      const now = Date.now();
      setEffectsDisplay({
        frenzy:     Math.max(0, Math.round((frenzyEndRef.current    - now) / 1000)),
        multiplier: Math.max(0, Math.round((multiplierEndRef.current - now) / 1000)),
        slowmo:     Math.max(0, Math.round((slowmoEndRef.current    - now) / 1000)),
      });
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(fishInterval);
          clearInterval(timeInterval);
          clearTimeout(bonusSpawnTimerRef.current);
          clearInterval(frenzySpawnRef.current);
          clearTimeout(badFishTimerRef.current);
          clearTimeout(fishRespawnTimerRef.current);
          badFishRef.current = [];
          setBadFish([]);
          setPhase('gameover');
          return 0;
        }
        if (now < slowmoEndRef.current) return t; // pause timer during slow-mo
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

    if (type === 'frenzy') {
      frenzyEndRef.current   = now + 10000;
      frenzyCleanedRef.current = false;
      clearInterval(frenzySpawnRef.current);
      frenzySpawnRef.current = setInterval(() => {
        if (Date.now() > frenzyEndRef.current) { clearInterval(frenzySpawnRef.current); return; }
        setFishArray((prev) => {
          if (prev.length >= Math.round(initialFishCount.current * FRENZY_FISH_MULT)) return prev;
          return [...prev, createOffscreenFish(nextId.current++)];
        });
      }, mobile ? MOBILE_FRENZY_INT : DESKTOP_FRENZY_INT);

      // Spawn 1–2 bad fish after a short delay
      clearTimeout(badFishTimerRef.current);
      badFishTimerRef.current = setTimeout(() => {
        if (frenzyEndRef.current <= 0 || Date.now() >= frenzyEndRef.current) return;
        const count = isMobileRef.current ? 2 : 4;
        const spawnedAt = Date.now();
        const newBadFish = Array.from({ length: count }, () => ({
          ...createOffscreenFish(nextId.current++),
          type: 'bad',
          spawnedAt,
          postEntrySpeedMult: BAD_FISH_SPEED_MULT,
          nextTurnAt: spawnedAt + BAD_FISH_TURN_MIN + Math.random() * (BAD_FISH_TURN_MAX - BAD_FISH_TURN_MIN),
        }));
        badFishRef.current = newBadFish;
        setBadFish(newBadFish);
      }, BAD_FISH_SPAWN_DELAY);
    } else if (type === 'timebonus') {
      setTimeLeft((prev) => Math.min(prev + 15, 99));
    } else if (type === 'multiplier') {
      multiplierEndRef.current = now + 8000;
    } else if (type === 'slowmo') {
      slowmoEndRef.current = now + 6000;
    }

    spawnPowerUpNotif(type);
  };

  // ── Bad fish click — ends frenzy and scatters all fish for 3s ──
  const handleBadFishClick = (fishId, e) => {
    e.stopPropagation();
    if (!badFishRef.current.find((f) => f.id === fishId) || phase !== 'running') return;

    // End frenzy immediately
    frenzyEndRef.current = 0;
    frenzyCleanedRef.current = true;
    clearInterval(frenzySpawnRef.current);
    clearTimeout(badFishTimerRef.current);

    // Remove all bad fish
    badFishRef.current = [];
    setBadFish([]);

    // Scatter all regular fish toward the nearest edge at high speed
    setFishArray((prev) => prev.map((f) => ({
      ...f,
      swimOff: true,
      justSpawned: false,
      speedMult: FISH_SCATTER_SPEED,
      angle: nearestEdgeAngle(f.x, f.y),
    })));

    // 3-second break before fish respawn
    clearTimeout(fishRespawnTimerRef.current);
    fishRespawnTimerRef.current = setTimeout(() => {
      setFishArray(Array.from({ length: initialFishCount.current }, () => createOffscreenFish(nextId.current++)));
    }, 3000);

    setScreenFlash('bad');
    setTimeout(() => setScreenFlash(null), 700);
    spawnPowerUpNotif('bad');
  };

  // ── Regular fish click ──
  const handleFishClick = (fishId, e) => {
    e.stopPropagation();
    if (phase !== 'running') return;

    // Sync cursor position — stopPropagation prevents container's onPointerDown from firing
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX != null && clientY != null) {
      cursorRef.current = { x: clientX, y: clientY };
      setCursorPos({ x: clientX, y: clientY });
    }

    const fishObj = fishArray.find((f) => f.id === fishId);
    if (!fishObj) return;
    const { colour, pattern } = fishObj;

    let points = 10;
    if (SUPER_COLOURS.includes(colour))     points = 200;
    else if (RARE_COLOURS.includes(colour)) points = 50;
    if (fishObj.speedFish) points = Math.floor(points * 3);
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
  };

  const handleCatchAnimationEnd = (animId) =>
    setCatchAnimations((prev) => prev.filter((a) => a.id !== animId));

  // ── Speed controls ──
  const handleReset     = () => { setFishArray(Array.from({ length: initialFishCount.current }, (_, i) => createRandomFish(i))); nextId.current = FISH_SIZE; setSpeed(4.0); };
  const handleSpeedDown = () => setSpeed((s) => Math.max(MIN_SPEED, parseFloat((s - 0.5).toFixed(2))));
  const handleSpeedUp   = () => setSpeed((s) => Math.min(MAX_SPEED, parseFloat((s + 0.5).toFixed(2))));

  // ── Submit score to global leaderboard ──
  const handleSubmitScore = async () => {
    if (submitting || scoreSubmitted) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitScore({
        playerName,
        score,
        sessionId: sessionToken.current,
        gameMode: 'timeTrial',
        records: caughtRecords,
      });
      setScoreSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── High score ──
  useEffect(() => {
    if (phase !== 'gameover') return;
    const saved = JSON.parse(localStorage.getItem('ttHighScore')) || { score: 0, records: [] };
    if (score > saved.score) {
      localStorage.setItem('ttHighScore', JSON.stringify({ score, records: caughtRecords }));
    }
  }, [phase, score, caughtRecords]);

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
              /* ── SUMMARY VIEW ── */
              <div className="gameover-summary">
                <h2 className="gameover-title">Game Over</h2>
                <div className="gameover-score-block">
                  <span className="gameover-score-number">{score}</span>
                  <span className="gameover-score-label">POINTS</span>
                </div>
                {leaderboardEnabled && (
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
                <div className="gameover-actions">
                  <button className="gameover-action-btn" onClick={() => setGameOverView('catches')}>
                    🐟 Fish Caught
                  </button>
                  <button className="gameover-action-btn gameover-action-primary" onClick={onPlayAgain}>
                    ▶ Play Again
                  </button>
                  <button className="gameover-action-btn" onClick={onGoHighScore}>
                    🏆 Leaderboard
                  </button>
                </div>
                <button className="gameover-home-link" onClick={onBackToHome}>Back to Home</button>
              </div>
            ) : (
              /* ── CATCHES VIEW ── */
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

  return (
    <div className="container" onPointerDown={handlePointerDown}>
      <button className="back-home-btn" onClick={onBackToHome}>Quit</button>

      {/* Active power-up vignettes */}
      {effectsDisplay.frenzy     > 0 && <div className="powerup-vignette powerup-vignette-frenzy" />}
      {effectsDisplay.multiplier > 0 && <div className="powerup-vignette powerup-vignette-multiplier" />}
      {effectsDisplay.slowmo     > 0 && <div className="powerup-vignette powerup-vignette-slowmo" />}

      {/* Screen flash on power-up catch */}
      {screenFlash && <div className={`screen-flash screen-flash-${screenFlash}`} />}

      {/* Floating score notifications */}
      {scoreNotifs.map((n) => (
        <span key={n.id} className={`score-notif score-notif-${n.rarity}`}
          style={{ left: `${n.x}px`, top: `${n.y}px` }}>
          +{n.points}
        </span>
      ))}

      {/* Power-up catch notifications */}
      {powerUpNotifs.map((n) => (
        <span key={n.id} className={`power-up-notif pup-notif-${n.type}`}
          style={{ left: `${n.x}px`, top: `${n.y}px` }}>
          {n.label}
        </span>
      ))}

      <div className="light-rays" />
      <div className="water-surface" />

      {/* FishDisplay handles Bubbles, live fish, hook cursor, and catch animations */}
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

      {/* Bonus fish (rendered on top of regular fish) */}
      {bonusFish.map((bf) => (
        <BonusFish
          key={bf.id}
          id={bf.id}
          x={bf.x}
          y={bf.y}
          type={bf.type}
          angle={bf.angle}
          onClick={(e) => handleBonusFishClick(bf.id, e)}
          isMobile={isMobile}
          isExpiring={Date.now() - bf.spawnedAt > BONUS_FISH_LIFESPAN - 2000}
        />
      ))}

      {/* Bad fish — frenzy trap (clicking any one ends frenzy and scatters all fish) */}
      {badFish.map((bdf) => (
        <BonusFish
          key={bdf.id}
          id={bdf.id}
          x={bdf.x}
          y={bdf.y}
          type="bad"
          angle={bdf.angle}
          onClick={(e) => handleBadFishClick(bdf.id, e)}
          isMobile={isMobile}
          isExpiring={false}
        />
      ))}

      <div className="time-left-display">Time: {timeLeft}s</div>
      <div className="top-center-ui">
        <div className="score-display">Score: {score}</div>
      </div>

      {/* Power-up HUD */}
      <div className="power-up-hud">
        {effectsDisplay.frenzy     > 0 && <div className="pup-pill pup-frenzy">💥 FRENZY {effectsDisplay.frenzy}s</div>}
        {effectsDisplay.multiplier > 0 && <div className="pup-pill pup-multiplier">⚡ x2 {effectsDisplay.multiplier}s</div>}
        {effectsDisplay.slowmo     > 0 && <div className="pup-pill pup-slowmo">❄ SLOW {effectsDisplay.slowmo}s</div>}
      </div>
    </div>
  );
}
