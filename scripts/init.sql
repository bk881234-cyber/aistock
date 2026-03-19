-- PostgreSQL 초기화 스크립트 (최초 컨테이너 생성 시 1회 실행)
-- 확장 모듈: UUID 생성 함수 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- 텍스트 유사도 검색 (종목명 검색 최적화)
