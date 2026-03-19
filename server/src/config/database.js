const { Sequelize } = require('sequelize');
const env = require('./env');

/**
 * Sequelize 연결 설정
 * - 로컬 개발: host/port/user/password 개별 설정
 * - Supabase: DATABASE_URL (connection string) 우선 사용
 *   Transaction Mode Pooler URL 권장:
 *   postgresql://postgres.[ref]:[pass]@aws-0-region.pooler.supabase.com:6543/postgres
 */

const isSupabase = !!process.env.DATABASE_URL;

const baseOptions = {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    // Vercel 서버리스: 함수당 최대 연결 수 최소화
    max:     isSupabase ? 2 : 10,
    min:     0,
    acquire: 30000,
    idle:    10000,
  },
  define: {
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   'updated_at',
  },
};

// Supabase는 SSL 필수
const supabaseDialectOptions = {
  ssl: {
    require:            true,
    rejectUnauthorized: false,  // Supabase 자체 서명 인증서 허용
  },
};

let sequelize;

if (isSupabase) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...baseOptions,
    dialectOptions: supabaseDialectOptions,
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    ...baseOptions,
    host: env.db.host,
    port: env.db.port,
    dialectOptions: env.NODE_ENV === 'production' ? supabaseDialectOptions : {},
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] 연결 성공 (${isSupabase ? 'Supabase' : 'Local'})`);
  } catch (err) {
    console.error('[DB] 연결 실패:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
