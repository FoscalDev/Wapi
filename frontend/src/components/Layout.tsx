import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export const Layout = ({
  onLogout,
  backendOnline,
  children,
}: {
  onLogout: () => void;
  backendOnline: boolean;
  children: ReactNode;
}) => (
  <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">WAPI Router Pro</div>
      <NavLink className="nav-link" to="/dashboard">
        Dashboard
      </NavLink>
      <NavLink className="nav-link" to="/configs">
        Numeros y Config
      </NavLink>
      <NavLink className="nav-link" to="/logs/messages">
        Logs Entrantes
      </NavLink>
      <NavLink className="nav-link" to="/logs/routing">
        Logs Enrutamiento
      </NavLink>
    </aside>
    <main className="content">
      <div className="topbar">
        <div className={`status-line ${backendOnline ? 'status-ok' : 'status-down'}`}>
          Backend: {backendOnline ? 'Conectado' : 'Sin conexion'}
        </div>
        <button onClick={onLogout}>Cerrar sesion</button>
      </div>
      {children}
    </main>
  </div>
);
