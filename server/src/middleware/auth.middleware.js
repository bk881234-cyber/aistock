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
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ success: false, message: '인증에 실패했습니다.' });
  }
};

module.exports = { authenticate };
