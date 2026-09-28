import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AgentDashboard() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [myTickets, setMyTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentTime, setCurrentTime] = useState(Date.now());

  const heartbeatTimers = useRef({});

  const user = JSON.parse(
    localStorage.getItem('user') || 'null',
  );

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'AGENT') {
      navigate('/customer');
      return;
    }

    loadDashboard();

    // Update SLA countdown every second
    const countdownTimer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    // Refresh dashboard every 10 seconds
    const refreshTimer = setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(refreshTimer);

      Object.values(heartbeatTimers.current).forEach(
        (timer) => clearInterval(timer),
      );

      heartbeatTimers.current = {};
    };
  }, []);

  const loadDashboard = async () => {
    try {
      setError('');

      const [queueResponse, assignedResponse] =
        await Promise.all([
          api.get('/tickets/queue'),
          api.get('/tickets/assigned'),
        ]);

      setQueue(queueResponse.data);
      setMyTickets(assignedResponse.data);

      // Start heartbeat for all currently assigned tickets
      assignedResponse.data.forEach((ticket) => {
        startHeartbeat(ticket.ticketId);
      });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }

      const message =
        err.response?.data?.message ||
        'Unable to load ticket dashboard.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const claimTicket = async (ticketId) => {
    try {
      setActionLoading(ticketId);
      setError('');
      setSuccess('');

      await api.post(`/tickets/${ticketId}/claim`);

      setSuccess(
        `${ticketId} claimed successfully.`,
      );

      await loadDashboard();

      startHeartbeat(ticketId);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to claim ticket.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );

      await loadDashboard();
    } finally {
      setActionLoading('');
    }
  };

  const startHeartbeat = (ticketId) => {
    if (heartbeatTimers.current[ticketId]) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        await api.post(
          `/tickets/${ticketId}/heartbeat`,
        );
      } catch {
        clearInterval(
          heartbeatTimers.current[ticketId],
        );

        delete heartbeatTimers.current[ticketId];

        await loadDashboard();
      }
    }, 60000);

    heartbeatTimers.current[ticketId] = timer;
  };

  const resolveTicket = async (ticketId) => {
    try {
      setActionLoading(ticketId);
      setError('');
      setSuccess('');

      await api.post(
        `/tickets/${ticketId}/resolve`,
      );

      if (heartbeatTimers.current[ticketId]) {
        clearInterval(
          heartbeatTimers.current[ticketId],
        );

        delete heartbeatTimers.current[ticketId];
      }

      setSuccess(
        `${ticketId} resolved successfully.`,
      );

      await loadDashboard();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to resolve ticket.';

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message,
      );
    } finally {
      setActionLoading('');
    }
  };

  const logout = () => {
    Object.values(heartbeatTimers.current).forEach(
      (timer) => clearInterval(timer),
    );

    heartbeatTimers.current = {};

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/login');
  };

  const getStatusClass = (status) => {
    if (status === 'Open') {
      return 'badge-open';
    }

    if (status === 'In Progress') {
      return 'badge-progress';
    }

    if (status === 'Resolved') {
      return 'badge-resolved';
    }

    return '';
  };

  const getUrgencyClass = (urgency) => {
    if (urgency === 'High') {
      return 'badge-high';
    }

    if (urgency === 'Medium') {
      return 'badge-medium';
    }

    if (urgency === 'Low') {
      return 'badge-low';
    }

    return '';
  };

  const formatRemainingTime = (ticket) => {
    if (!ticket.slaDeadline) {
      return 'No SLA';
    }

    const remaining =
      new Date(ticket.slaDeadline).getTime() -
      currentTime;

    if (remaining <= 0 || ticket.isOverdue) {
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

    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const isMyTicket = (ticket) => {
    return (
      ticket.assignedAgent &&
      ticket.assignedAgent.toString() ===
        user?.id?.toString()
    );
  };

  const renderTicket = (
    ticket,
    showClaimButton = false,
  ) => {
    const slaExpired =
      ticket.slaDeadline &&
      new Date(ticket.slaDeadline).getTime() <=
        currentTime;

    const overdue =
      ticket.isOverdue || slaExpired;

    const mine = isMyTicket(ticket);

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
            Customer: {ticket.customerName}
          </span>

          <span className="badge">
            {ticket.customerEmail}
          </span>
        </div>

        <div className="ticket-meta">
          <span className="badge">
            SLA Deadline:{' '}
            {ticket.slaDeadline
              ? new Date(
                  ticket.slaDeadline,
                ).toLocaleString()
              : 'N/A'}
          </span>

          <span
            className={`badge ${
              overdue
                ? 'badge-overdue'
                : ''
            }`}
          >
            {formatRemainingTime(ticket)}
          </span>
        </div>

        {showClaimButton &&
          ticket.status === 'Open' && (
            <div className="ticket-actions">
              <button
                className="action-button"
                onClick={() =>
                  claimTicket(
                    ticket.ticketId,
                  )
                }
                disabled={
                  actionLoading ===
                  ticket.ticketId
                }
              >
                {actionLoading ===
                ticket.ticketId
                  ? 'Claiming...'
                  : 'Claim Ticket'}
              </button>
            </div>
          )}

        {mine &&
          ticket.status === 'In Progress' && (
            <div className="ticket-actions">
              <button
                className="resolve-button action-button"
                onClick={() =>
                  resolveTicket(
                    ticket.ticketId,
                  )
                }
                disabled={
                  actionLoading ===
                  ticket.ticketId
                }
              >
                {actionLoading ===
                ticket.ticketId
                  ? 'Resolving...'
                  : 'Resolve Ticket'}
              </button>
            </div>
          )}
      </div>
    );
  };

  const openTickets = queue.filter(
    (ticket) =>
      ticket.status === 'Open' &&
      !ticket.assignedAgent,
  );

  const assignedTickets = myTickets;

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

          <span className="badge badge-progress">
            AGENT
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
          <h1>Agent Dashboard</h1>

          <p>
            Manage support tickets and resolve
            customer issues.
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

        <div className="card">
          <h2>
            Open Ticket Queue (
            {openTickets.length})
          </h2>

          {loading ? (
            <div className="loading">
              Loading queue...
            </div>
          ) : openTickets.length === 0 ? (
            <div className="empty-state">
              No open tickets available.
            </div>
          ) : (
            <div className="ticket-list">
              {openTickets.map((ticket) =>
                renderTicket(ticket, true),
              )}
            </div>
          )}
        </div>

        <div
          className="card"
          style={{ marginTop: '24px' }}
        >
          <h2>
            My In-Progress Tickets (
            {assignedTickets.length})
          </h2>

          {assignedTickets.length === 0 ? (
            <div className="empty-state">
              You don't have any tickets in
              progress.
            </div>
          ) : (
            <div className="ticket-list">
              {assignedTickets.map((ticket) =>
                renderTicket(ticket, false),
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AgentDashboard;

