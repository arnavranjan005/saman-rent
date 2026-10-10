import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/vendors', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-bold text-gray-900">SamanRent Admin</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in with your admin email.</p>
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            required
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            autoComplete="username"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            required
            data-testid="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p data-testid="login-error" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          data-testid="login-submit"
          className="mt-4 w-full rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
