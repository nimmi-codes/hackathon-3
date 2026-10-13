import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { homeFor, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import { PageTransition, SkeletonCards } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CustomerPortal from './pages/CustomerPortal.jsx';
import AdminPortal from './pages/AdminPortal.jsx';

// No role => any logged-in user (staff aren't blocked from /app); role="admin" => staff only
function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <SkeletonCards n={3} />;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/app" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SkeletonCards n={1} />;
  if (user) return <Navigate to={homeFor(user)} replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/login" element={<PageTransition><GuestOnly><AuthPage mode="login" /></GuestOnly></PageTransition>} />
          <Route path="/signup" element={<PageTransition><GuestOnly><AuthPage mode="signup" /></GuestOnly></PageTransition>} />
          <Route path="/app" element={<PageTransition><Protected><CustomerPortal /></Protected></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Protected role="admin"><AdminPortal /></Protected></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
