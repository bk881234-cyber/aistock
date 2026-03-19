const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem,
} = require('../controllers/watchlist.controller');
const { watchlistAddRules, validate } = require('../middleware/validation');

router.use(authenticate);

router.get('/',                                   getWatchlist);
router.post('/',  watchlistAddRules, validate,    addToWatchlist);
router.put('/:id',                                updateWatchlistItem);
router.delete('/:id',                             removeFromWatchlist);

module.exports = router;
