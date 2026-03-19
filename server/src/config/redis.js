const env = require('./env');

/**
 * Redis 어댑터
 * - 개발 (REDIS_HOST 있음): ioredis / redis v4 로컬 연결
 * - 프로덕션 / Vercel (UPSTASH_REDIS_REST_URL 있음): @upstash/redis HTTP 클라이언트
 *
 * 모든 호출부는 getCache / setCache / delCache 만 사용하므로
 * 구현체가 바뀌어도 나머지 코드 변경 없음.
 */

const isUpstash = !!process.env.UPSTASH_REDIS_REST_URL;

let _upstashClient = null;

const getUpstash = () => {
  if (!_upstashClient) {
    const { Redis } = require('@upstash/redis');
    _upstashClient = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _upstashClient;
};

// ── 로컬 redis v4 클라이언트 (개발 전용) ─────────────────
let _localClient = null;

const getLocalClient = async () => {
  if (_localClient) return _localClient;
  const { createClient } = require('redis');
  const client = createClient({
    socket: {
      host: env.redis.host,
      port: env.redis.port,
      reconnectStrategy: (r) => Math.min(r * 100, 3000),
    },
    ...(env.redis.password && { password: env.redis.password }),
  });
  client.on('error', (e) => console.error('[Redis] 에러:', e.message));
  client.on('connect', () => console.log('[Redis] 로컬 연결 성공'));
  await client.connect().catch(() => {}); // 연결 실패 시 캐시 없이 동작
  _localClient = client;
  return client;
};

// ── 공개 인터페이스 ──────────────────────────────────────

const connectRedis = async () => {
  if (isUpstash) {
    console.log('[Redis] Upstash 모드 활성화');
    return;
  }
  await getLocalClient();
};

const getCache = async (key) => {
  try {
    if (isUpstash) {
      const val = await getUpstash().get(key);
      // Upstash는 JSON을 자동 파싱해 반환
      return val ?? null;
    }
    const client = await getLocalClient();
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  try {
    if (isUpstash) {
      await getUpstash().set(key, value, { ex: ttlSeconds });
      return;
    }
    const client = await getLocalClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (e) {
    console.error('[Redis] setCache 실패:', e.message);
  }
};

const delCache = async (key) => {
  try {
    if (isUpstash) {
      await getUpstash().del(key);
      return;
    }
    const client = await getLocalClient();
    await client.del(key);
  } catch (e) {
    console.error('[Redis] delCache 실패:', e.message);
  }
};

module.exports = { connectRedis, getCache, setCache, delCache };
