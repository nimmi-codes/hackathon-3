import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

export default function Nav() {
  const { user, logout } = useAuth();
  const { pathname, search } = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname, search]);

  const isAdmin = user?.role === 'admin';
  const tab = new URLSearchParams(search).get('tab');
  const links = isAdmin
    ? [
        ['Dashboard', '/admin', !tab || tab === 'dashboard', pathname === '/admin'],
        ['Listings & Rent', '/admin?tab=listings', tab === 'listings', pathname === '/admin'],
        ['Reports', '/admin?tab=reports', tab === 'reports', pathname === '/admin'],
      ].map(([l, to, a, p]) => [l, to, a && p])
    : [
        ['Find Boarding', '/app', pathname === '/app' && (!tab || tab === 'find' || tab === 'mine')],
        ['Report Issue', '/app?tab=report', pathname === '/app' && tab === 'report'],
        ...(!user ? [['Staff Login', '/login', pathname === '/login']] : []),
      ];

  const doLogout = () => { logout(); nav('/'); };
  const actions = user ? (
    <button className="btn glass-btn sm" onClick={doLogout}>Logout</button>
  ) : (
    <Link to="/login" className="btn glass-btn sm">Sign in / Sign up</Link>
  );

  return (
    <header className="nav-wrap">
      <nav className="glass nav" aria-label="Main">
        <Link to="/" className="brand">Boarding<em>Finder</em></Link>
        <div className="nav-links">
          {links.map(([label, to, active]) => (
            <Link key={label} to={to} className={'nav-link' + (active ? ' active' : '')} aria-current={active ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">{actions}</div>
        <button className="burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div className="glass mobile-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {links.map(([label, to, active]) => (
              <Link key={label} to={to} className={'nav-link' + (active ? ' active' : '')}>{label}</Link>
            ))}
            {actions}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
