import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/customer"
          element={<CustomerDashboard />}
        />

        <Route
          path="/agent"
          element={<AgentDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;