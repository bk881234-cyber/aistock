const router = require('express').Router();
const { getIndices, getFx, getCommodities, getOverview } = require('../controllers/market.controller');

// 시장 데이터는 인증 없이도 조회 가능 (공개 API)
router.get('/overview',     getOverview);
router.get('/indices',      getIndices);
router.get('/fx',           getFx);
router.get('/commodities',  getCommodities);

module.exports = router;
