import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient, useSession } from '../lib/auth-client';

export default function UserMenu() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (isPending) return <div className="user-skel" />;

  const user = session?.user;
  if (!user) {
    return (
      <Link to="/sign-in" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
        Sign in
      </Link>
    );
  }

  const initial = (user.name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-avatar"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
      >
        {initial}
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-name">{user.name || 'Anonymous'}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <hr />
          <Link to="/me" className="user-item" onClick={() => setOpen(false)}>
            My palettes
          </Link>
          <button
            className="user-item"
            onClick={async () => {
              await authClient.signOut();
              setOpen(false);
              navigate('/');
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
