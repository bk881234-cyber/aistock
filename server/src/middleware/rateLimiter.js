const rateLimit = require('express-rate-limit');

// 일반 API 요청 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
});

// AI 리포트 생성 제한 (Claude API 비용 보호)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1시간
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI 리포트 요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.' },
});

// 로그인 브루트포스 방지
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.' },
});

module.exports = { generalLimiter, aiLimiter, authLimiter };
