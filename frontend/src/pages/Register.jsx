import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
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
      await api.post('/auth/register', form);

      navigate('/login');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.';

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
        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Register for the Helpdesk system
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              Account Type
            </label>

            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="CUSTOMER">
                Customer
              </option>

              <option value="AGENT">
                Support Agent
              </option>
            </select>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{' '}
          <Link to="/login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;