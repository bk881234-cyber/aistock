const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getPortfolio, buyStock, sellStock, updateSettings, getTransactions,
} = require('../controllers/portfolio.controller');
const {
  buyRules, sellRules, portfolioSettingsRules, validate,
} = require('../middleware/validation');

router.use(authenticate);

router.get('/',                               getPortfolio);
router.post('/buy',   buyRules,  validate,    buyStock);
router.post('/sell',  sellRules, validate,    sellStock);
router.put('/:id/settings', portfolioSettingsRules, validate, updateSettings);
router.get('/:id/transactions',               getTransactions);

module.exports = router;
