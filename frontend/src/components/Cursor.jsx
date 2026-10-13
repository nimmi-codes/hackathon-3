import { useEffect, useRef } from 'react';

// Soft green dot + lagging ring. Only on fine pointers (not touch); ring disabled for reduced motion.
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = dot.current;
    const r = ring.current;
    document.body.classList.add('has-cursor');
    if (reduce) r.classList.add('off');

    let x = 0, y = 0, rx = 0, ry = 0, raf = 0;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate3d(${x}px,${y}px,0)`;
      d.classList.add('on');
      if (!reduce) r.classList.add('on');
      const t = e.target;
      const onField = !!t.closest?.('input,textarea,select,option');
      d.classList.toggle('hide', onField);
      r.classList.toggle('hide', onField);
      r.classList.toggle('grow', !!t.closest?.('a,button,[role="button"],label,.hoverable'));
    };
    const leave = () => { d.classList.remove('on'); r.classList.remove('on'); };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      r.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true"><span /></div>
      <div ref={ring} className="cursor-ring" aria-hidden="true"><span /></div>
    </>
  );
}
