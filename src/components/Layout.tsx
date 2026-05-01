import { NavLink, Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">⌂</span>
            <span className="brand-name">
              Grounded<span className="brand-accent">Palette</span>
            </span>
          </Link>
          <nav className="nav">
            <NavLink to="/browse" end>
              Browse
            </NavLink>
            <NavLink to="/create">Create</NavLink>
            <NavLink to="/blocks">Blocks</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>
            Block data & images from{' '}
            <a href="https://grounded.wiki.gg/wiki/Base_Building_(Grounded_2)" target="_blank" rel="noreferrer">
              grounded.wiki.gg
            </a>
            . Fan project — not affiliated with Obsidian or Microsoft.
          </span>
          <span className="footer-mono">v0.1 · 🍂 backyard build</span>
        </div>
      </footer>
    </div>
  );
}
