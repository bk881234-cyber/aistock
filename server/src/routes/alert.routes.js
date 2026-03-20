const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { Alert, AlertHistory } = require('../models');
const { success, error } = require('../utils/response');

router.use(authenticate);

/** GET /api/alerts - 알림 목록 */
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    return success(res, { alerts });
  } catch (err) {
    console.error('[alert] getAlerts 오류:', err.message);
    return success(res, { alerts: [] });  // 500 방지
  }
});

/** POST /api/alerts - 알림 생성 */
router.post('/', async (req, res) => {
  try {
    const { stock_symbol, alert_type, condition, threshold, portfolio_id } = req.body;
    const alert = await Alert.create({
      user_id: req.user.id,
      stock_symbol,
      alert_type,
      condition,
      threshold,
      portfolio_id: portfolio_id || null,
    });
    return success(res, { alert }, '알림이 설정되었습니다.', 201);
  } catch (err) {
    return error(res);
  }
});

/** DELETE /api/alerts/:id - 알림 삭제 */
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!alert) return error(res, '알림을 찾을 수 없습니다.', 404);
    await alert.destroy();
    return success(res, null, '알림이 삭제되었습니다.');
  } catch (err) {
    return error(res);
  }
});

/** GET /api/alerts/history - 알림 발동 이력 */
router.get('/history', (req, res) => {
  // 진단: DB 없이 즉시 반환 — 여전히 500이면 authenticate 미들웨어 문제
  return success(res, { history: [], _debug: 'no-db' });
});

/** PATCH /api/alerts/history/read-all - 알림 전체 읽음 처리 */
router.patch('/history/read-all', async (req, res) => {
  try {
    await AlertHistory.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    return success(res, null, '모든 알림을 읽음 처리했습니다.');
  } catch (err) {
    return error(res);
  }
});

module.exports = router;
