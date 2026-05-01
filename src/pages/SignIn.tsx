import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../lib/auth-client';

export default function SignIn() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = search.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message || 'Sign in failed');
      return;
    }
    navigate(next);
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="page-sub">Sign in to publish palettes and like builds.</p>

        <form onSubmit={submit} className="form" style={{ marginTop: 18 }}>
          <label className="form-row">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="form-row">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary save-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-foot">
          New here?{' '}
          <Link to={`/sign-up${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
