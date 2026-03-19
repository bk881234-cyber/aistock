-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  AIstock — Supabase 초기 스키마
--  Supabase 대시보드 → SQL Editor → New Query 에 붙여넣고 실행
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 확장 모듈
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name         VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── user_profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  risk_tolerance    VARCHAR(20)  DEFAULT 'moderate',
  investment_style  VARCHAR(20)  DEFAULT 'mixed',
  target_return_pct DECIMAL(5,2) DEFAULT 10.00,
  preferred_sectors JSONB        DEFAULT '[]',
  notif_email       BOOLEAN      DEFAULT true,
  notif_push        BOOLEAN      DEFAULT true,
  notif_sms         BOOLEAN      DEFAULT false,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- ── watchlists ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlists (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_symbol VARCHAR(20)  NOT NULL,
  stock_name   VARCHAR(100) NOT NULL,
  market       VARCHAR(10)  NOT NULL,
  alert_price  DECIMAL(15,4),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stock_symbol)
);

-- ── portfolios ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_symbol       VARCHAR(20)  NOT NULL,
  stock_name         VARCHAR(100) NOT NULL,
  market             VARCHAR(10)  NOT NULL,
  quantity           DECIMAL(15,4) NOT NULL DEFAULT 0,
  avg_buy_price      DECIMAL(15,4) NOT NULL,
  target_sell_price  DECIMAL(15,4),
  stop_loss_price    DECIMAL(15,4),
  trailing_stop_pct  DECIMAL(5,2),
  realized_gain      DECIMAL(15,4) DEFAULT 0,
  status             VARCHAR(10) DEFAULT 'active',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id, status);

-- ── transactions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(10) NOT NULL,
  quantity        DECIMAL(15,4) NOT NULL,
  price_per_share DECIMAL(15,4) NOT NULL,
  total_amount    DECIMAL(15,4) NOT NULL,
  fee             DECIMAL(10,4) DEFAULT 0,
  transaction_date TIMESTAMPTZ  DEFAULT NOW(),
  notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio ON transactions(portfolio_id);

-- ── alerts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  stock_symbol VARCHAR(20)  NOT NULL,
  alert_type   VARCHAR(30)  NOT NULL,
  condition    VARCHAR(20)  NOT NULL,
  threshold    DECIMAL(15,4) NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── alert_history ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id      UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  triggered_at  TIMESTAMPTZ DEFAULT NOW(),
  trigger_value DECIMAL(15,4) NOT NULL,
  message       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_alert_history_user ON alert_history(user_id, is_read);

-- ── market_cache ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_cache (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type    VARCHAR(20)  NOT NULL,
  symbol       VARCHAR(30)  UNIQUE NOT NULL,
  current_val  DECIMAL(20,6),
  prev_close   DECIMAL(20,6),
  change_val   DECIMAL(20,6),
  change_pct   DECIMAL(7,4),
  high_52w     DECIMAL(20,6),
  low_52w      DECIMAL(20,6),
  raw_json     JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  ttl_seconds  INTEGER DEFAULT 60
);

-- ── stock_weather ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_weather (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_symbol   VARCHAR(20) UNIQUE NOT NULL,
  weather        VARCHAR(20) NOT NULL,
  weather_score  INTEGER NOT NULL,
  rsi_14         DECIMAL(7,4),
  macd_signal    VARCHAR(10),
  bb_position    VARCHAR(20),
  volume_ratio   DECIMAL(7,4),
  moving_avg_pos VARCHAR(20),
  analyzed_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL
);

-- ── ai_reports ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_symbol VARCHAR(20)  NOT NULL,
  report_type  VARCHAR(30)  NOT NULL,
  positives    JSONB DEFAULT '[]',
  negatives    JSONB DEFAULT '[]',
  one_liner    VARCHAR(500),
  full_text    TEXT NOT NULL,
  confidence   DECIMAL(5,2),
  source_urls  JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_reports_symbol ON ai_reports(stock_symbol, report_type);

-- ── curations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword        VARCHAR(100) NOT NULL,
  sector         VARCHAR(100) NOT NULL,
  related_stocks JSONB DEFAULT '[]',
  trend_score    INTEGER DEFAULT 0,
  summary        TEXT,
  curated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── shared_cards ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_cards (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_type  VARCHAR(30) NOT NULL,
  image_url  VARCHAR(500),
  metadata   JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── updated_at 자동 갱신 트리거 ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','user_profiles','watchlists','portfolios','alerts']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated ON %s;
       CREATE TRIGGER trg_%s_updated
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t, t, t, t
    );
  END LOOP;
END $$;
