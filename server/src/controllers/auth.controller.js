const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, UserProfile } = require('../models');
const { success, error } = require('../utils/response');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return error(res, '이메일, 비밀번호, 이름은 필수입니다.', 400);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return error(res, '이미 사용 중인 이메일입니다.', 409);
    }

    const user = await User.create({ email, password_hash: password, name });
    await UserProfile.create({ user_id: user.id });

    const token = generateToken(user.id);
    return success(res, { token, user: { id: user.id, email: user.email, name: user.name } }, '회원가입 성공', 201);
  } catch (err) {
    console.error('[auth] register 오류:', err);
    return error(res, '회원가입 중 오류가 발생했습니다.');
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, '이메일과 비밀번호를 입력해주세요.', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return error(res, '이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    const token = generateToken(user.id);
    return success(res, { token, user: { id: user.id, email: user.email, name: user.name } }, '로그인 성공');
  } catch (err) {
    console.error('[auth] login 오류:', err);
    return error(res, '로그인 중 오류가 발생했습니다.');
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'created_at'],
      include: [{ association: 'profile' }],
    });
    return success(res, { user });
  } catch (err) {
    console.error('[auth] getMe 오류:', err);
    return error(res, '사용자 정보 조회 중 오류가 발생했습니다.');
  }
};

module.exports = { register, login, getMe };
