import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Nav from './Nav.jsx';
import Cursor from './Cursor.jsx';

// Persistent shell: background, cursor, nav, footer. Only {children} (the routes) animate.
export default function Layout({ children }) {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className={'shell' + (admin ? ' is-admin' : '')}>
      <div className="bg" aria-hidden="true" />
      <Cursor />
      <motion.div
        key={pathname}
        className="progress"
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 0.7, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 0.8, times: [0, 0.5, 1] }}
      />
      <Nav />
      <main className="page-area">{children}</main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Boarding<em>Finder</em>.lk</span>
        <span>Find, compare and report boarding houses across Sri Lanka</span>
      </footer>
    </div>
  );
}
