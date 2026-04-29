import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import api, { getBackendHealth, setToken } from './services/api';
import { Layout } from './components/Layout';
import { ConfigsPage } from './pages/ConfigsPage';
import { DashboardPage } from './pages/DashboardPage';
import { MessageLogsPage } from './pages/MessageLogsPage';
import { RoutingLogsPage } from './pages/RoutingLogsPage';
import { UsersPage } from './pages/UsersPage';
import { WebhookSettingsPage } from './pages/WebhookSettingsPage';
import { AppPermission, AppUser } from './types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: 'outline'; size: 'large'; width?: number },
          ) => void;
        };
      };
    };
  }
}

const GoogleLoginPage = ({ onLogin }: { onLogin: (token: string, user: AppUser) => void }) => {
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) {
      setError('Falta VITE_GOOGLE_CLIENT_ID en frontend/.env');
      return;
    }
    const scriptId = 'google-identity-script';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initialize = () => {
      const container = document.getElementById('google-login-button');
      if (!container || !window.google) return;
      container.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setError('No se recibio token de Google');
            return;
          }
          try {
            const res = await api.post('/auth/google', { idToken: response.credential });
            onLogin(res.data.access_token as string, res.data.user as AppUser);
          } catch {
            setError('No fue posible autenticar con Google');
          }
        },
      });
      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    };

    if (existing) {
      initialize();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => setError('No se pudo cargar Google Identity Services');
    document.body.appendChild(script);
  }, [clientId, onLogin]);

  return (
    <div>
      <h2>Iniciar sesion</h2>
      <p>Accede con tu cuenta de Google corporativa.</p>
      <div id="google-login-button" />
      <p>{error}</p>
    </div>
  );
};

const PendingAccessPage = ({ onLogout }: { onLogout: () => void }) => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
    <div className="panel" style={{ width: 520 }}>
      <h2 style={{ marginTop: 0, color: '#0f4c81' }}>Cuenta pendiente de permisos</h2>
      <p>
        Tu cuenta fue registrada correctamente, pero aun no tienes permisos asignados para usar la
        plataforma.
      </p>
      <p>Solicita a un administrador que te habilite accesos desde el modulo de usuarios.</p>
      <button onClick={onLogout}>Cerrar sesion</button>
    </div>
  </div>
);

const sanitizeUser = (value: unknown): AppUser | null => {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<AppUser>;
  if (!raw.id || !raw.email || !raw.full_name) return null;
  const permissions = Array.isArray(raw.permissions) ? raw.permissions : [];
  return {
    id: raw.id,
    email: raw.email,
    full_name: raw.full_name,
    avatar_url: raw.avatar_url,
    is_active: typeof raw.is_active === 'boolean' ? raw.is_active : true,
    permissions,
    can_access: typeof raw.can_access === 'boolean' ? raw.can_access : permissions.length > 0,
  };
};

const hasPermission = (user: AppUser | null, permission: AppPermission) => {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes('*') || permissions.includes(permission);
};

export const App = () => {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<AppUser | null>(() => {
    const cached = localStorage.getItem('user');
    if (!cached) return null;
    try {
      return sanitizeUser(JSON.parse(cached));
    } catch {
      return null;
    }
  });
  const [backendOnline, setBackendOnline] = useState(false);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  useEffect(() => setToken(token), [token]);
  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      setUser(null);
      return;
    }
    setAuthLoading(true);
    void api
      .get('/auth/me')
      .then((res) => {
        const nextUser = sanitizeUser(res.data);
        if (!nextUser) {
          throw new Error('Respuesta de usuario invalida');
        }
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTokenState(null);
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, [token]);

  useEffect(() => {
    const check = () =>
      getBackendHealth()
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    void check();
    const timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, []);

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTokenState(null);
    setUser(null);
  };

  const availableRoutes = useMemo(
    () => ({
      dashboard: hasPermission(user, 'dashboard.read'),
      configs: hasPermission(user, 'configs.manage'),
      logs: hasPermission(user, 'logs.read') || hasPermission(user, 'logs.manage'),
      settings: hasPermission(user, 'settings.manage'),
      users: hasPermission(user, 'users.manage'),
    }),
    [user],
  );

  if (!token) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="panel" style={{ width: 420 }}>
          <h2 style={{ marginTop: 0, color: '#0f4c81' }}>WAPI Router Pro</h2>
          <p style={{ color: '#0f766e' }}>Accede al panel operativo</p>
          <GoogleLoginPage
            onLogin={(newToken, currentUser) => {
              localStorage.setItem('token', newToken);
              localStorage.setItem('user', JSON.stringify(currentUser));
              setTokenState(newToken);
              setUser(currentUser);
            }}
          />
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="panel">Cargando sesion...</div>;
  }

  if (!user?.can_access) {
    return <PendingAccessPage onLogout={doLogout} />;
  }

  const defaultRoute = availableRoutes.dashboard
    ? '/dashboard'
    : availableRoutes.configs
      ? '/configs'
      : availableRoutes.logs
        ? '/logs/messages'
        : availableRoutes.settings
          ? '/settings/webhook'
          : availableRoutes.users
            ? '/users'
            : '/';

  return (
    <Layout
      backendOnline={backendOnline}
      onLogout={doLogout}
      user={user}
      routes={availableRoutes}
    >
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} />} />
        <Route
          path="/dashboard"
          element={availableRoutes.dashboard ? <DashboardPage /> : <Navigate to={defaultRoute} />}
        />
        <Route
          path="/configs"
          element={availableRoutes.configs ? <ConfigsPage /> : <Navigate to={defaultRoute} />}
        />
        <Route
          path="/logs/messages"
          element={availableRoutes.logs ? <MessageLogsPage /> : <Navigate to={defaultRoute} />}
        />
        <Route
          path="/logs/routing"
          element={availableRoutes.logs ? <RoutingLogsPage /> : <Navigate to={defaultRoute} />}
        />
        <Route
          path="/settings/webhook"
          element={availableRoutes.settings ? <WebhookSettingsPage /> : <Navigate to={defaultRoute} />}
        />
        <Route
          path="/users"
          element={availableRoutes.users ? <UsersPage /> : <Navigate to={defaultRoute} />}
        />
      </Routes>
    </Layout>
  );
};
