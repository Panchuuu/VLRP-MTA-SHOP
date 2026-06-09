import { useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Gallery from './pages/Gallery';
import Rules from './pages/Rules';
import Staff from './pages/Staff';
import Leaderboard from './pages/Leaderboard';
import Faq from './pages/Faq';
import Vips from './pages/Vips';
import Wallet from './pages/Wallet';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// ── Admin: lazy (recharts + panel no se cargan para el visitante normal) ──
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminFaqs = lazy(() => import('./pages/admin/AdminFaqs'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminCodes = lazy(() => import('./pages/admin/AdminCodes'));
const AdminComparison = lazy(() => import('./pages/admin/AdminComparison'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080810]">
      <div className="w-10 h-10 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/vips" element={<Vips />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />

          {/* Admin (lazy + Suspense; AdminLayout con <Outlet />) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminLayout />
                </Suspense>
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="codes" element={<AdminCodes />} />
            <Route path="comparison" element={<AdminComparison />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const initTheme = useThemeStore((s) => s.init);
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Hidratar el user al montar: persist guarda el token pero NO el user, así que
  // tras recargar disparamos GET /auth/me para que el Navbar muestre el avatar.
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (token) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f0f1a',
            color: '#f1f5f9',
            border: '1px solid #1e1e30',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
        }}
      />
    </>
  );
}
