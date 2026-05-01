import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SignUp() {
  useDocumentTitle('Sign up');
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = search.get('next') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message || 'Sign up failed');
      return;
    }
    navigate(next);
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>Join the backyard</h1>
        <p className="page-sub">Make an account to share your palettes.</p>

        <form onSubmit={submit} className="form" style={{ marginTop: 18 }}>
          <label className="form-row">
            <span>Display name</span>
            <input
              required
              className="input"
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
              placeholder="BackyardBuilder"
            />
          </label>
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
              autoComplete="new-password"
              required
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary save-btn" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth-foot">
          Already have one?{' '}
          <Link to={`/sign-in${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
