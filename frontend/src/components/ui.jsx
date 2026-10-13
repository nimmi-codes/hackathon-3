import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function PageTransition({ children }) {
  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ tag, children, sub }) {
  return (
    <header className="page-head">
      <span className="glass chip">{tag}</span>
      <h1>{children}</h1>
      {sub && <p className="sub">{sub}</p>}
    </header>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={'skeleton ' + className} aria-hidden="true" />;
}

export function SkeletonCards({ n = 6 }) {
  return (
    <div className="grid" role="status" aria-label="Loading">
      {Array.from({ length: n }, (_, i) => (
        <div className="glass card" key={i}>
          <Skeleton className="w60" /><Skeleton className="w90" /><Skeleton className="w40 tall" /><Skeleton className="w70" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ n = 5 }) {
  return (
    <div className="glass panel" role="status" aria-label="Loading">
      {Array.from({ length: n }, (_, i) => <Skeleton key={i} className="row-sk" />)}
    </div>
  );
}

export function Empty({ icon = '🌿', title, text }) {
  return (
    <div className="glass empty">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const key = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    const prev = document.activeElement;
    ref.current?.querySelector('input,select,textarea,button')?.focus();
    return () => { document.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div ref={ref} className="glass modal" role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.25 }}>
            <div className="modal-head">
              <h2>{title}</h2>
              <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
