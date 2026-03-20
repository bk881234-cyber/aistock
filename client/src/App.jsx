import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// 레이아웃
import AppLayout from '@/components/layout/AppLayout';

// 페이지 (lazy import로 번들 분리)
import { lazy, Suspense } from 'react';

const Dashboard   = lazy(() => import('@/pages/Dashboard'));
const Portfolio   = lazy(() => import('@/pages/Portfolio'));
const Watchlist   = lazy(() => import('@/pages/Watchlist'));
const StockDetail = lazy(() => import('@/pages/StockDetail'));
const Curation    = lazy(() => import('@/pages/Curation'));
const Settings    = lazy(() => import('@/pages/Settings'));
const Calculator  = lazy(() => import('@/pages/Calculator'));
const Login       = lazy(() => import('@/pages/Auth/Login'));
const Register    = lazy(() => import('@/pages/Auth/Register'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// 인증 보호 라우트
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 인증 필요 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index                   element={<Dashboard />} />
          <Route path="portfolio"        element={<Portfolio />} />
          <Route path="watchlist"        element={<Watchlist />} />
          <Route path="stock/:symbol"    element={<StockDetail />} />
          <Route path="curation"         element={<Curation />} />
          <Route path="calculator"       element={<Calculator />} />
          <Route path="settings"         element={<Settings />} />
        </Route>

        {/* 404 폴백 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
