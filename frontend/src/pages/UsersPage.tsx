import { useEffect, useState } from 'react';
import api from '../services/api';
import { AppPermission, AppUser } from '../types';

const PERMISSIONS: AppPermission[] = [
  'dashboard.read',
  'configs.manage',
  'logs.read',
  'logs.manage',
  'settings.manage',
  'users.manage',
];

export const UsersPage = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draftUsers, setDraftUsers] = useState<Record<string, AppUser>>({});
  const [provisionForm, setProvisionForm] = useState({
    email: '',
    full_name: '',
    permissions: [] as AppPermission[],
    is_active: true,
  });
  const [provisioning, setProvisioning] = useState(false);

  const load = async () => {
    const res = await api.get('/users');
    const nextUsers = res.data as AppUser[];
    setUsers(nextUsers);
    setDraftUsers(
      nextUsers.reduce<Record<string, AppUser>>((acc, user) => {
        acc[user.id] = { ...user };
        return acc;
      }, {}),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const togglePermission = (userId: string, permission: AppPermission) => {
    setDraftUsers((prev) => {
      const user = prev[userId];
      if (!user) return prev;
      const has = user.permissions.includes(permission);
      return {
        ...prev,
        [userId]: {
          ...user,
          permissions: has
            ? user.permissions.filter((entry) => entry !== permission)
            : [...user.permissions, permission],
        },
      };
    });
  };

  const saveAccess = async (userId: string) => {
    const user = draftUsers[userId];
    if (!user) return;
    setSavingUserId(user.id);
    try {
      await api.patch(`/users/${user.id}/access`, {
        permissions: user.permissions.filter((permission) => permission !== '*'),
        is_active: user.is_active,
      });
      await load();
      setEditingUserId(null);
    } finally {
      setSavingUserId(null);
    }
  };

  const startEdit = (user: AppUser) => {
    setDraftUsers((prev) => ({ ...prev, [user.id]: { ...user } }));
    setEditingUserId(user.id);
  };

  const cancelEdit = (user: AppUser) => {
    setDraftUsers((prev) => ({ ...prev, [user.id]: { ...user } }));
    setEditingUserId(null);
  };

  const toggleProvisionPermission = (permission: AppPermission) => {
    setProvisionForm((prev) => {
      const has = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((entry) => entry !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const provisionUser = async () => {
    setProvisioning(true);
    try {
      await api.post('/users/provision', provisionForm);
      setProvisionForm({
        email: '',
        full_name: '',
        permissions: [],
        is_active: true,
      });
      await load();
    } finally {
      setProvisioning(false);
    }
  };

  if (loading) return <div className="panel">Cargando usuarios...</div>;

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Usuarios y permisos</h3>
      <p style={{ marginTop: 0 }}>
        Puedes pre-crear usuarios y asignar permisos antes de su primer login con Google.
      </p>
      <div className="panel" style={{ marginTop: 10 }}>
        <h4 style={{ marginTop: 0 }}>Alta manual de usuario</h4>
        <div className="filters">
          <input
            placeholder="Email"
            value={provisionForm.email}
            onChange={(e) => setProvisionForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            placeholder="Nombre completo"
            value={provisionForm.full_name}
            onChange={(e) =>
              setProvisionForm((prev) => ({ ...prev, full_name: e.target.value }))
            }
          />
          <label className="permission-item">
            <input
              type="checkbox"
              checked={provisionForm.is_active}
              onChange={(e) =>
                setProvisionForm((prev) => ({ ...prev, is_active: e.target.checked }))
              }
            />
            Activo
          </label>
        </div>
        <div className="permission-grid" style={{ marginBottom: 10 }}>
          {PERMISSIONS.map((permission) => (
            <label key={permission} className="permission-item">
              <input
                type="checkbox"
                checked={provisionForm.permissions.includes(permission)}
                onChange={() => toggleProvisionPermission(permission)}
              />
              {permission}
            </label>
          ))}
        </div>
        <button onClick={() => void provisionUser()} disabled={provisioning}>
          {provisioning ? 'Guardando...' : 'Crear o actualizar usuario'}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Activo</th>
            <th>Permisos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSuperAdmin = user.permissions.includes('*');
            const draft = draftUsers[user.id] ?? user;
            const isEditing = editingUserId === user.id;
            return (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    disabled={isSuperAdmin || !isEditing}
                    onChange={(e) =>
                      setDraftUsers((prev) => ({
                        ...prev,
                        [user.id]: { ...draft, is_active: e.target.checked },
                      }))
                    }
                  />
                </td>
                <td>
                  {isSuperAdmin ? (
                    <span className="badge success">Administrador total</span>
                  ) : (
                    <div className="permission-grid">
                      {PERMISSIONS.map((permission) => (
                        <label key={permission} className="permission-item">
                          <input
                            type="checkbox"
                            checked={draft.permissions.includes(permission)}
                            disabled={!isEditing}
                            onChange={() => togglePermission(user.id, permission)}
                          />
                          {permission}
                        </label>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => void saveAccess(user.id)}
                        disabled={isSuperAdmin || savingUserId === user.id}
                      >
                        {savingUserId === user.id ? 'Guardando...' : 'Guardar'}
                      </button>{' '}
                      <button
                        className="secondary"
                        onClick={() => cancelEdit(user)}
                        disabled={savingUserId === user.id}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {isSuperAdmin ? (
                        <span className="badge pending">Protegido</span>
                      ) : (
                        <button className="secondary" onClick={() => startEdit(user)}>
                          Editar
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
