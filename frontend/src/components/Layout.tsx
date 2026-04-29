import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppUser } from '../types';

export const Layout = ({
  onLogout,
  backendOnline,
  user,
  routes,
  children,
}: {
  onLogout: () => void;
  backendOnline: boolean;
  user: AppUser;
  routes: {
    dashboard: boolean;
    configs: boolean;
    logs: boolean;
    settings: boolean;
    users: boolean;
  };
  children: ReactNode;
}) => (
  <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">WAPI Router Pro</div>
      {routes.dashboard ? (
        <NavLink className="nav-link" to="/dashboard">
          Dashboard
        </NavLink>
      ) : null}
      {routes.configs ? (
        <NavLink className="nav-link" to="/configs">
          Numeros y Config
        </NavLink>
      ) : null}
      {routes.logs ? (
        <>
          <NavLink className="nav-link" to="/logs/messages">
            Logs Entrantes
          </NavLink>
          <NavLink className="nav-link" to="/logs/routing">
            Logs Enrutamiento
          </NavLink>
        </>
      ) : null}
      {routes.settings ? (
        <NavLink className="nav-link" to="/settings/webhook">
          Ajustes Webhook
        </NavLink>
      ) : null}
      {routes.users ? (
        <NavLink className="nav-link" to="/users">
          Usuarios y Permisos
        </NavLink>
      ) : null}
    </aside>
    <main className="content">
      <div className="topbar">
        <div className={`status-line ${backendOnline ? 'status-ok' : 'status-down'}`}>
          Backend: {backendOnline ? 'Conectado' : 'Sin conexion'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{user.full_name}</span>
          <button onClick={onLogout}>Cerrar sesion</button>
        </div>
      </div>
      {children}
    </main>
  </div>
);
