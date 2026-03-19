/** 최소 테스트 — 아무것도 import 안 함 */
module.exports = (req, res) => {
  res.status(200).json({ ok: true, env: process.env.NODE_ENV });
};
