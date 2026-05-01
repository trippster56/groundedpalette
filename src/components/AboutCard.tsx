import { useEffect, useRef } from 'react';

const PinIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const AboutCard = () => {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const parent = wrap.closest('.about-cluster-stage') as HTMLElement | null;
    if (!parent) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      wrap.style.setProperty('--mx', cx.toFixed(3));
      wrap.style.setProperty('--my', cy.toFixed(3));
      raf = requestAnimationFrame(tick);
    };

    parent.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="about-cluster" aria-hidden="true">
      <div className="about-card">
        <div className="about-card-shine" />
        <div className="about-card-row">
          <span className="mono micro">N° 26—04</span>
          <span className="mono micro about-card-status">
            <span className="dot" /> ONLINE
          </span>
        </div>
        <div className="about-card-roles">
          <div>PALETTES</div>
          <div>FOR THE</div>
          <div>BACKYARD<span className="prim">.</span></div>
        </div>
        <div className="about-card-row">
          <span className="mono micro"><PinIcon /> THE YARD</span>
          <span className="mono micro">v1.0</span>
        </div>
      </div>

      <div className="orbit orbit-1">
        <div className="orbit-inner orbit-logo">
          <img src="/grounded2-favicon.png" alt="" loading="lazy" />
        </div>
      </div>

      <div className="orbit orbit-2">
        <div className="orbit-inner orbit-block">
          <img src="/blocks/pumpkin-pumpkin-wall.png" alt="" loading="lazy" />
        </div>
      </div>

      <div className="orbit orbit-3">
        <div className="orbit-inner orbit-block">
          <img src="/blocks/mushroom-mushroom-wall.png" alt="" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

export default AboutCard;
