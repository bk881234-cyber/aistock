const { Portfolio, Transaction } = require('../models');
const { success, error } = require('../utils/response');
const { sequelize } = require('../config/database');

/**
 * GET /api/portfolio
 * 보유 종목 전체 조회 (실시간 수익률은 프론트에서 현재가와 합산)
 */
const getPortfolio = async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { user_id: req.user.id, status: 'active' },
      
      order: [['created_at', 'DESC']],
    });
    return success(res, { portfolios });
  } catch (err) {
    console.error('[portfolio] getPortfolio 오류:', err);
    return error(res);
  }
};

/**
 * POST /api/portfolio/buy
 * 매수 처리 → 포트폴리오 생성 또는 평균 매수가 재계산
 */
const buyStock = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { stock_symbol, stock_name, market, quantity, price_per_share, fee = 0 } = req.body;

    if (!stock_symbol || !stock_name || !market || !quantity || !price_per_share) {
      return error(res, '필수 입력값이 누락되었습니다.', 400);
    }

    const totalAmount = quantity * price_per_share + Number(fee);

    let portfolio = await Portfolio.findOne({
      where: { user_id: req.user.id, stock_symbol, status: 'active' },
      transaction: t,
    });

    if (portfolio) {
      // 평균 매수가 재계산: (기존총액 + 신규총액) / (기존수량 + 신규수량)
      const prevTotal = portfolio.avg_buy_price * portfolio.quantity;
      const newQty = Number(portfolio.quantity) + Number(quantity);
      const newAvg = (prevTotal + quantity * price_per_share) / newQty;

      await portfolio.update(
        { quantity: newQty, avg_buy_price: newAvg },
        { transaction: t }
      );
    } else {
      portfolio = await Portfolio.create({
        user_id: req.user.id,
        stock_symbol,
        stock_name,
        market,
        quantity,
        avg_buy_price: price_per_share,
      }, { transaction: t });
    }

    await Transaction.create({
      portfolio_id: portfolio.id,
      user_id: req.user.id,
      type: 'buy',
      quantity,
      price_per_share,
      total_amount: totalAmount,
      fee,
    }, { transaction: t });

    await t.commit();
    return success(res, { portfolio }, '매수가 처리되었습니다.', 201);
  } catch (err) {
    await t.rollback();
    console.error('[portfolio] buyStock 오류:', err);
    return error(res, '매수 처리 중 오류가 발생했습니다.');
  }
};

/**
 * POST /api/portfolio/sell
 * 매도 처리 → 수량 차감, 0이 되면 status=closed
 */
const sellStock = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { portfolio_id, quantity, price_per_share, fee = 0 } = req.body;

    const portfolio = await Portfolio.findOne({
      where: { id: portfolio_id, user_id: req.user.id, status: 'active' },
      transaction: t,
    });

    if (!portfolio) return error(res, '보유 종목을 찾을 수 없습니다.', 404);
    if (Number(portfolio.quantity) < Number(quantity)) {
      return error(res, '보유 수량보다 많은 수량을 매도할 수 없습니다.', 400);
    }

    const totalAmount = quantity * price_per_share - Number(fee);
    const gain = (price_per_share - portfolio.avg_buy_price) * quantity - Number(fee);
    const newQty = Number(portfolio.quantity) - Number(quantity);

    await portfolio.update({
      quantity: newQty,
      realized_gain: Number(portfolio.realized_gain) + gain,
      status: newQty === 0 ? 'closed' : 'active',
    }, { transaction: t });

    await Transaction.create({
      portfolio_id: portfolio.id,
      user_id: req.user.id,
      type: 'sell',
      quantity,
      price_per_share,
      total_amount: totalAmount,
      fee,
    }, { transaction: t });

    await t.commit();
    return success(res, { portfolio, realized_gain: gain.toFixed(2) }, '매도가 처리되었습니다.');
  } catch (err) {
    await t.rollback();
    console.error('[portfolio] sellStock 오류:', err);
    return error(res, '매도 처리 중 오류가 발생했습니다.');
  }
};

/**
 * PUT /api/portfolio/:id/settings
 * 목표가 / 손절가 / 트레일링 스탑 설정
 */
const updateSettings = async (req, res) => {
  try {
    const { target_sell_price, stop_loss_price, trailing_stop_pct } = req.body;
    const portfolio = await Portfolio.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!portfolio) return error(res, '보유 종목을 찾을 수 없습니다.', 404);

    await portfolio.update({ target_sell_price, stop_loss_price, trailing_stop_pct });
    return success(res, { portfolio }, '설정이 업데이트되었습니다.');
  } catch (err) {
    console.error('[portfolio] updateSettings 오류:', err);
    return error(res);
  }
};

/**
 * GET /api/portfolio/:id/transactions
 * 특정 종목 거래 이력 조회
 */
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { portfolio_id: req.params.id, user_id: req.user.id },
      order: [['transaction_date', 'DESC']],
    });
    return success(res, { transactions });
  } catch (err) {
    console.error('[portfolio] getTransactions 오류:', err);
    return error(res);
  }
};

module.exports = { getPortfolio, buyStock, sellStock, updateSettings, getTransactions };
