const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { getWeather, getReport, generateReport, getSellGuide } = require('../controllers/ai.controller');

router.use(authenticate);

router.get('/weather/:symbol',              getWeather);
router.get('/report/:symbol',               getReport);
router.post('/report/:symbol/generate',     aiLimiter, generateReport);
router.get('/sell-guide/:portfolioId',      getSellGuide);

module.exports = router;
