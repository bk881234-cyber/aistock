const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate }           = require('../middleware/auth.middleware');
const { authLimiter }            = require('../middleware/rateLimiter');
const { registerRules, loginRules, validate } = require('../middleware/validation');

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);
router.get('/me',        authenticate, getMe);

module.exports = router;
