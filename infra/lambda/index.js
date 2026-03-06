const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME  = process.env.TABLE_NAME;
const HMAC_SECRET = process.env.HMAC_SECRET;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hmacHex(message) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(message).digest('hex');
}

function sanitizeName(raw) {
  if (typeof raw !== 'string') return 'Anonymous';
  const cleaned = raw.replace(/[<>"'&]/g, '').trim().slice(0, 20);
  return cleaned.length > 0 ? cleaned : 'Anonymous';
}

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod;

  if (method === 'GET')  return handleGet(event);
  if (method === 'POST') return handlePost(event);

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};

async function handleGet(event) {
  const mode  = event.queryStringParameters?.mode ?? 'timeTrial';
  const gsiPk = `SCORES#${mode}`;

  try {
    const result = await client.send(new QueryCommand({
      TableName:                 TABLE_NAME,
      IndexName:                 'gsiPk-score-index',
      KeyConditionExpression:    'gsiPk = :pk',
      ExpressionAttributeValues: { ':pk': gsiPk },
      ScanIndexForward:          false,
      Limit:                     10,
    }));

    const scores = (result.Items ?? []).map(({ playerName, score, createdAt, records }) => ({
      playerName, score, createdAt, records: records ?? [],
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scores),
    };
  } catch (err) {
    console.error('GET error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
}

async function handlePost(event) {
  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { playerName, score, sessionId, timestamp, signature, gameMode, records } = body;

  if (
    typeof score     !== 'number' ||
    typeof sessionId !== 'string' ||
    typeof timestamp !== 'number' ||
    typeof signature !== 'string' ||
    typeof gameMode  !== 'string'
  ) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!Number.isInteger(score) || score < 0 || score > 500000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Score out of range' }) };
  }

  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Request expired' }) };
  }

  const expected = hmacHex(`${sessionId}:${score}:${timestamp}`);
  const sigBuf   = Buffer.from(signature, 'hex');
  const expBuf   = Buffer.from(expected,  'hex');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  const cleanName    = sanitizeName(playerName);
  const cleanRecords = records && typeof records === 'object' && !Array.isArray(records)
    ? Object.fromEntries(
        Object.entries(records)
          .filter(([k, v]) => typeof k === 'string' && Number.isInteger(v) && v > 0)
          .slice(0, 100)
          .map(([k, v]) => [k.slice(0, 30), v])
      )
    : {};
  const gsiPk = `SCORES#${gameMode}`;

  try {
    await client.send(new PutCommand({
      TableName:           TABLE_NAME,
      Item: {
        id:         sessionId,
        gsiPk,
        score,
        playerName: cleanName,
        createdAt:  new Date().toISOString(),
        records:    cleanRecords,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }));

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 409, body: JSON.stringify({ error: 'Score already submitted for this session' }) };
    }
    console.error('POST error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
}
