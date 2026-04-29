import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import api, { getBackendHealth, setToken } from './services/api';
import { Layout } from './components/Layout';
import { ConfigsPage } from './pages/ConfigsPage';
import { DashboardPage } from './pages/DashboardPage';
import { MessageLogsPage } from './pages/MessageLogsPage';
import { RoutingLogsPage } from './pages/RoutingLogsPage';

const LoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState('admin@local.dev');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.access_token);
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button onClick={login}>Ingresar</button>
      <p>{error}</p>
    </div>
  );
};

export const App = () => {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => setToken(token), [token]);
  useEffect(() => {
    const check = () =>
      getBackendHealth()
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    void check();
    const timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!token) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="panel" style={{ width: 420 }}>
          <h2 style={{ marginTop: 0, color: '#0f4c81' }}>WAPI Router Pro</h2>
          <p style={{ color: '#0f766e' }}>Accede al panel operativo</p>
          <LoginPage
            onLogin={(newToken) => {
              localStorage.setItem('token', newToken);
              setTokenState(newToken);
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <Layout
      backendOnline={backendOnline}
      onLogout={() => {
        localStorage.removeItem('token');
        setTokenState(null);
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/configs" element={<ConfigsPage />} />
        <Route path="/logs/messages" element={<MessageLogsPage />} />
        <Route path="/logs/routing" element={<RoutingLogsPage />} />
      </Routes>
    </Layout>
  );
};
