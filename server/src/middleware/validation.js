const { body, param, query, validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * 검증 결과 처리 미들웨어 (라우트 체인 끝에 추가)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, errors.array()[0].msg, 400, errors.array());
  }
  next();
};

// ── 인증 ──────────────────────────────────────────────────
const registerRules = [
  body('email')
    .isEmail().withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('이메일이 너무 깁니다.'),
  body('password')
    .isLength({ min: 8, max: 72 }).withMessage('비밀번호는 8~72자여야 합니다.')
    .matches(/[A-Za-z]/).withMessage('비밀번호에 영문자가 포함되어야 합니다.')
    .matches(/[0-9]/).withMessage('비밀번호에 숫자가 포함되어야 합니다.'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('이름은 1~50자여야 합니다.')
    .escape(),
];

const loginRules = [
  body('email').isEmail().withMessage('이메일 형식이 올바르지 않습니다.').normalizeEmail(),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
];

// ── 포트폴리오 ────────────────────────────────────────────
const buyRules = [
  body('stock_symbol')
    .trim().toUpperCase()
    .matches(/^[A-Z0-9.]{1,20}$/).withMessage('종목코드 형식이 올바르지 않습니다.'),
  body('stock_name')
    .trim().isLength({ min: 1, max: 100 }).withMessage('종목명은 1~100자여야 합니다.').escape(),
  body('market')
    .isIn(['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ']).withMessage('유효한 시장 구분을 선택해주세요.'),
  body('quantity')
    .isFloat({ min: 0.0001 }).withMessage('수량은 0보다 커야 합니다.')
    .toFloat(),
  body('price_per_share')
    .isFloat({ min: 0.0001 }).withMessage('매수가는 0보다 커야 합니다.')
    .toFloat(),
  body('fee')
    .optional()
    .isFloat({ min: 0 }).withMessage('수수료는 0 이상이어야 합니다.')
    .toFloat(),
];

const sellRules = [
  body('portfolio_id').isUUID().withMessage('유효한 포트폴리오 ID가 아닙니다.'),
  body('quantity').isFloat({ min: 0.0001 }).withMessage('수량은 0보다 커야 합니다.').toFloat(),
  body('price_per_share').isFloat({ min: 0.0001 }).withMessage('매도가는 0보다 커야 합니다.').toFloat(),
  body('fee').optional().isFloat({ min: 0 }).toFloat(),
];

const portfolioSettingsRules = [
  param('id').isUUID().withMessage('유효한 포트폴리오 ID가 아닙니다.'),
  body('target_sell_price').optional().isFloat({ min: 0 }).toFloat(),
  body('stop_loss_price').optional().isFloat({ min: 0 }).toFloat(),
  body('trailing_stop_pct').optional().isFloat({ min: 0.1, max: 50 }).toFloat(),
];

// ── 관심 종목 ─────────────────────────────────────────────
const watchlistAddRules = [
  body('stock_symbol')
    .trim().toUpperCase()
    .matches(/^[A-Z0-9.]{1,20}$/).withMessage('종목코드 형식이 올바르지 않습니다.'),
  body('stock_name')
    .trim().isLength({ min: 1, max: 100 }).escape(),
  body('market')
    .isIn(['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ']),
  body('alert_price').optional().isFloat({ min: 0 }).toFloat(),
  body('notes').optional().trim().isLength({ max: 500 }).escape(),
];

// ── 알림 ──────────────────────────────────────────────────
const alertRules = [
  body('stock_symbol')
    .trim().toUpperCase()
    .matches(/^[A-Z0-9.]{1,20}$/),
  body('alert_type')
    .isIn(['price_target', 'stop_loss', 'trailing_stop', 'weather_change', 'volume_surge', 'news_break']),
  body('condition').isIn(['above', 'below', 'pct_change']),
  body('threshold').isFloat({ min: 0 }).toFloat(),
  body('portfolio_id').optional().isUUID(),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  buyRules,
  sellRules,
  portfolioSettingsRules,
  watchlistAddRules,
  alertRules,
};
