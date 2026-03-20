require('dotenv').config();
const { MarketCache, Portfolio, Transaction, User } = require('../src/models');
const { sequelize } = require('../src/config/database');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('[SEED] DB 연결 성공');

    // 1. 시장 데이터 (Indices)
    const indices = [
      {
        data_type: 'index',
        symbol: 'KOSPI',
        current_val: 2650.12,
        change_val: 12.45,
        change_pct: 0.47,
        last_updated: new Date()
      },
      {
        data_type: 'index',
        symbol: 'NASDAQ',
        current_val: 16210.34,
        change_val: -45.12,
        change_pct: -0.28,
        last_updated: new Date()
      },
      {
        data_type: 'fx',
        symbol: 'USDKRW',
        current_val: 1325.50,
        change_pct: 0.12,
        last_updated: new Date()
      }
    ];

    for (const item of indices) {
      await MarketCache.upsert(item);
    }
    console.log('[SEED] 시장 데이터 시딩 완료');

    // 2. 샘플 포트폴리오 (첫 번째 유저 대상)
    const user = await User.findOne();
    if (user) {
      const portfolio = await Portfolio.create({
        user_id: user.id,
        stock_symbol: '005930.KS',
        stock_name: '삼성전자',
        market: 'KOSPI',
        quantity: 10,
        avg_buy_price: 72000.00
      });

      await Transaction.create({
        portfolio_id: portfolio.id,
        user_id: user.id,
        type: 'buy',
        quantity: 10,
        price_per_share: 72000.00,
        total_amount: 720000.00,
        fee: 0
      });
      console.log('[SEED] 샘플 포트폴리오 생성 완료');
    }

    process.exit(0);
  } catch (err) {
    console.error('[SEED] 실패:', err.message);
    process.exit(1);
  }
};

seed();
