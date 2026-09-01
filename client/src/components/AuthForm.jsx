import { useState } from 'react';
import { api, setToken } from '../api/client';

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = mode === 'login' ? await api.login(email, password) : await api.signup(email, password);
      setToken(result.token);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  return (
    <div className="auth-shell">
      <div className="file-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className="file-tab"
          aria-selected={mode === 'login'}
          onClick={() => switchMode('login')}
        >
          Access file
        </button>
        <button
          type="button"
          role="tab"
          className="file-tab"
          aria-selected={mode === 'signup'}
          onClick={() => switchMode('signup')}
        >
          Open new file
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <h2>{mode === 'login' ? 'Access Case File' : 'Open a Case File'}</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {mode === 'signup' && <p className="field-hint">Minimum 8 characters.</p>}
        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create file'}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;
