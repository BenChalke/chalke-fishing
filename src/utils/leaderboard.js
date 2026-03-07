const API_URL     = process.env.REACT_APP_API_URL;
const HMAC_SECRET = process.env.REACT_APP_HMAC_SECRET;

export const leaderboardEnabled = Boolean(API_URL && HMAC_SECRET);

async function hmacSign(message) {
  const enc     = new TextEncoder();
  const keyData = enc.encode(HMAC_SECRET);
  const msgData = enc.encode(message);

  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig  = await crypto.subtle.sign('HMAC', key, msgData);
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function submitScore({ playerName, score, sessionId, gameMode, records = {}, pointsScore }) {
  const timestamp = Date.now();
  const signature = await hmacSign(`${sessionId}:${score}:${timestamp}`);

  const res = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, score, sessionId, timestamp, signature, gameMode, records,
      ...(pointsScore != null ? { pointsScore } : {}) }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getScores(mode = 'timeTrial') {
  const res = await fetch(`${API_URL}/scores?mode=${mode}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
