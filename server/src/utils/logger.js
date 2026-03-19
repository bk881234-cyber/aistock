const winston = require('winston');
const path    = require('path');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

// ── 개발: 컬러 콘솔 출력 ─────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) =>
    stack ? `${ts} ${level}: ${message}\n${stack}` : `${ts} ${level}: ${message}`
  )
);

// ── 프로덕션: JSON (로그 수집 도구 연동) ─────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [
  new winston.transports.Console(),
];

if (isProd) {
  // 운영: 로그 파일 분리 (에러 별도 보관)
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize:  10 * 1024 * 1024,  // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize:  20 * 1024 * 1024,
      maxFiles: 10,
    })
  );
}

const logger = winston.createLogger({
  level:  isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports,
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
