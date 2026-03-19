/**
 * 일관된 API 응답 형식 헬퍼
 */
const success = (res, data = null, message = '성공', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = '서버 오류가 발생했습니다.', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

const paginated = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  });
};

module.exports = { success, error, paginated };
