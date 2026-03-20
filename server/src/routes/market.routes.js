const router = require('express').Router();
const { getIndices, getFx, getCommodities, getOverview, searchStock, getChart, getStockDetail } = require('../controllers/market.controller');

// 시장 데이터는 인증 없이도 조회 가능 (공개 API)
router.get('/overview',        getOverview);
router.get('/indices',         getIndices);
router.get('/fx',              getFx);
router.get('/commodities',     getCommodities);
router.get('/search',          searchStock);     // 종목 검색 자동완성
router.get('/chart/:symbol',   getChart);        // 일/주/월/년 차트 스파크라인
router.get('/stock/:symbol',   getStockDetail);  // 종목 상세 (현재가 + OHLCV 캔들)

module.exports = router;
