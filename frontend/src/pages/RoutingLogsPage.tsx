import { useEffect, useState } from 'react';
import api from '../services/api';
import { AppUser, RoutingLog } from '../types';

export const RoutingLogsPage = () => {
  const [data, setData] = useState<RoutingLog[]>([]);
  const [selected, setSelected] = useState<RoutingLog | null>(null);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteResult, setDeleteResult] = useState('');
  const [deleteRange, setDeleteRange] = useState({ from: '', to: '' });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const currentUser = (() => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AppUser;
    } catch {
      return null;
    }
  })();
  const canDeleteLogs = Boolean(
    currentUser?.permissions?.includes('*') || currentUser?.permissions?.includes('logs.manage'),
  );

  const load = () =>
    api
      .get('/logs/routing', {
        params: {
          phone_number_id: phoneFilter || undefined,
          status: statusFilter || undefined,
        },
      })
      .then((res) => setData(res.data as RoutingLog[]));

  useEffect(() => {
    void load();
  }, []);

  const deleteByRange = async () => {
    setDeleteError('');
    setDeleteResult('');
    if (!deleteRange.from || !deleteRange.to) {
      setDeleteError('Debes ingresar fecha desde y hasta.');
      return;
    }
    if (deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR') {
      setDeleteError('Debes escribir ELIMINAR para confirmar.');
      return;
    }
    setDeleting(true);
    try {
      const res = await api.delete('/logs/routing', {
        params: {
          from: new Date(deleteRange.from).toISOString(),
          to: new Date(deleteRange.to).toISOString(),
        },
      });
      const deletedCount = (res.data as { deleted_count: number }).deleted_count;
      setDeleteResult(`Se eliminaron ${deletedCount} logs.`);
      await load();
    } catch {
      setDeleteError('No se pudo eliminar logs con ese rango.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="panel">
      <div className="filters">
        <input placeholder="Filtrar Phone ID" value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos</option>
          <option value="success">success</option>
          <option value="failed">failed</option>
          <option value="pending">pending</option>
        </select>
        <button onClick={() => void load()}>Aplicar filtros</button>
        {canDeleteLogs ? (
          <button className="secondary" onClick={() => setShowDeleteModal(true)}>
            Eliminar por rango
          </button>
        ) : null}
      </div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>App</th><th>Phone ID</th><th>Destino</th><th>Estado</th><th>Intentos</th><th>Latencia</th><th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{new Date(item.processed_at).toLocaleString()}</td>
              <td>{item.app_name}</td>
              <td>{item.phone_number_id}</td>
              <td>{item.target_webhook}</td>
              <td><span className={`badge ${item.status}`}>{item.status}</span></td>
              <td>{item.attempts}</td>
              <td>{item.latency_ms ?? 0} ms</td>
              <td><button className="secondary" onClick={() => setSelected(item)}>Ver detalle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle de enrutamiento</h3>
            <p><strong>HTTP:</strong> {selected.http_status ?? 'N/A'}</p>
            <p><strong>Error:</strong> {selected.error_message ?? 'Sin error'}</p>
            <h4>Payload enviado al destino</h4>
            <pre>{JSON.stringify(selected.request_body ?? {}, null, 2)}</pre>
            <h4>Respuesta del destino</h4>
            <pre>{JSON.stringify(selected.response_body ?? {}, null, 2)}</pre>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar logs de enrutamiento por rango</h3>
            <p style={{ marginTop: 0 }}>
              Esta accion es irreversible. Escribe <strong>ELIMINAR</strong> para confirmar.
            </p>
            <div className="filters">
              <label>
                Desde
                <input
                  type="datetime-local"
                  value={deleteRange.from}
                  onChange={(e) =>
                    setDeleteRange((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Hasta
                <input
                  type="datetime-local"
                  value={deleteRange.to}
                  onChange={(e) =>
                    setDeleteRange((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Confirmacion
                <input
                  placeholder="ELIMINAR"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </label>
            </div>
            {deleteError ? <p style={{ color: '#b91c1c' }}>{deleteError}</p> : null}
            {deleteResult ? <p style={{ color: '#166534' }}>{deleteResult}</p> : null}
            <div className="filters">
              <button onClick={() => void deleteByRange()} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Confirmar eliminacion'}
              </button>
              <button className="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
