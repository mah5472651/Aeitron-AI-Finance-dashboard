import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, rememberMe);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
            <span className="text-white font-bold text-2xl"><img src="/aeitron_icon_fb.png" alt="" />
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">Aeitron AI</h1>
          <p className="text-text-muted text-sm mt-1">Finance Management Dashboard</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-card border border-border rounded-2xl p-8 space-y-5"
        >
          {/* Error Message */}
          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2.5 animate-fade-in">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text text-sm placeholder:text-text-muted/50 outline-none transition-all duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text text-sm placeholder:text-text-muted/50 outline-none transition-all duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>

          {/* Remember Me */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <span className="text-sm text-text-muted">Remember me</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted/50 mt-6">
          &copy; {new Date().getFullYear()} Aeitron AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
