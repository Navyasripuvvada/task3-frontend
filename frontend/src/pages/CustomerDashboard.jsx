import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function CustomerDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    urgency: 'Medium',
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(
    localStorage.getItem('user') || 'null',
  );

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }

    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/tickets/my');

      setTickets(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      const message =
        err.response?.data?.message ||
        'Unable to load your tickets.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/tickets', form);

      setForm({
        subject: '',
        description: '',
        urgency: 'Medium',
      });

      setSuccess('Ticket created successfully.');

      await loadTickets();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to create ticket.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setCreating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/login');
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'badge-open';
    if (status === 'In Progress') return 'badge-progress';
    if (status === 'Resolved') return 'badge-resolved';

    return '';
  };

  const getUrgencyClass = (urgency) => {
    if (urgency === 'High') return 'badge-high';
    if (urgency === 'Medium') return 'badge-medium';
    if (urgency === 'Low') return 'badge-low';

    return '';
  };

  const getRemainingTime = (deadline) => {
    const remaining =
      new Date(deadline).getTime() - Date.now();

    if (remaining <= 0) {
      return 'Overdue';
    }

    const totalSeconds = Math.floor(
      remaining / 1000,
    );

    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          Helpdesk
        </div>

        <div className="navbar-user">
          <span>
            {user?.name || user?.email}
          </span>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Customer Dashboard</h1>

          <p>
            Create and track your support tickets.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="card" style={{ marginBottom: '24px' }}>
          <h2>Create Support Ticket</h2>

          <form onSubmit={handleCreateTicket}>
            <div className="form-group">
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What do you need help with?"
                value={form.subject}
                onChange={handleChange}
                maxLength={200}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Describe your issue..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="urgency">
                Urgency
              </label>

              <select
                id="urgency"
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={creating}
            >
              {creating
                ? 'Creating...'
                : 'Submit Ticket'}
            </button>
          </form>
        </div>

        <div className="dashboard-header">
          <h2>My Tickets</h2>
        </div>

        {loading ? (
          <div className="card loading">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="card empty-state">
            You haven't submitted any tickets yet.
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => {
              const overdue =
                ticket.isOverdue ||
                new Date(ticket.slaDeadline) <=
                  new Date();

              return (
                <div
                  className="ticket-card"
                  key={ticket.ticketId}
                >
                  <div className="ticket-top">
                    <div>
                      <div className="ticket-id">
                        {ticket.ticketId}
                      </div>

                      <div className="ticket-subject">
                        {ticket.subject}
                      </div>
                    </div>

                    <div className="ticket-meta">
                      <span
                        className={`badge ${getStatusClass(
                          ticket.status,
                        )}`}
                      >
                        {ticket.status}
                      </span>

                      <span
                        className={`badge ${getUrgencyClass(
                          ticket.urgency,
                        )}`}
                      >
                        {ticket.urgency}
                      </span>

                      {overdue && (
                        <span className="badge badge-overdue">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="ticket-description">
                    {ticket.description}
                  </p>

                  <div className="ticket-meta">
                    <span className="badge">
                      SLA:{' '}
                      {new Date(
                        ticket.slaDeadline,
                      ).toLocaleString()}
                    </span>

                    <span className="badge">
                      {getRemainingTime(
                        ticket.slaDeadline,
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;