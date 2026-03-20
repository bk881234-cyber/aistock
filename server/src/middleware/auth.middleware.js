const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name'],
    });
    if (!user) {
      return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  } catch (err) {
    // JWT 오류는 401 (클라이언트 토큰 문제)
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name)) {
      const msg = err.name === 'TokenExpiredError' ? '토큰이 만료되었습니다.' : '인증에 실패했습니다.';
      return res.status(401).json({ success: false, message: msg });
    }
    // DB 연결 오류 등 → 503 반환 (401 반환 시 클라이언트가 토큰 삭제 후 강제 로그아웃됨)
    console.error('[auth] authenticate DB 오류:', err.message);
    return res.status(503).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { authenticate };
