const { Watchlist } = require('../models');
const { success, error } = require('../utils/response');

/** GET /api/watchlist */
const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    return success(res, { items });
  } catch (err) {
    console.error('[watchlist] getWatchlist 오류:', err);
    return error(res);
  }
};

/** POST /api/watchlist */
const addToWatchlist = async (req, res) => {
  try {
    const { stock_symbol, stock_name, market, alert_price, notes } = req.body;

    if (!stock_symbol || !stock_name || !market) {
      return error(res, '종목코드, 종목명, 시장 구분은 필수입니다.', 400);
    }

    const item = await Watchlist.create({
      user_id: req.user.id,
      stock_symbol,
      stock_name,
      market,
      alert_price,
      notes,
    });
    return success(res, { item }, '관심 종목에 추가되었습니다.', 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return error(res, '이미 관심 종목에 등록된 종목입니다.', 409);
    }
    console.error('[watchlist] addToWatchlist 오류:', err);
    return error(res);
  }
};

/** DELETE /api/watchlist/:id */
const removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!item) return error(res, '관심 종목을 찾을 수 없습니다.', 404);

    await item.destroy();
    return success(res, null, '관심 종목에서 삭제되었습니다.');
  } catch (err) {
    console.error('[watchlist] removeFromWatchlist 오류:', err);
    return error(res);
  }
};

/** PUT /api/watchlist/:id */
const updateWatchlistItem = async (req, res) => {
  try {
    const { alert_price, notes } = req.body;
    const item = await Watchlist.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!item) return error(res, '관심 종목을 찾을 수 없습니다.', 404);

    await item.update({ alert_price, notes });
    return success(res, { item }, '업데이트되었습니다.');
  } catch (err) {
    console.error('[watchlist] updateWatchlistItem 오류:', err);
    return error(res);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem };
