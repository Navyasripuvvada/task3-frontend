import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);

      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'AGENT') {
        navigate('/agent');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Login failed. Please check your email and password.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Helpdesk</h1>

        <p className="auth-subtitle">
          Sign in to your support account
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;