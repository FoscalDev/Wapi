import { useEffect, useState } from 'react';
import api from '../services/api';
import { AppUser, MessageLog } from '../types';

export const MessageLogsPage = () => {
  const [data, setData] = useState<MessageLog[]>([]);
  const [selected, setSelected] = useState<MessageLog | null>(null);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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
      .get('/logs/messages', {
        params: {
          phone_number_id: phoneFilter || undefined,
          message_type: typeFilter || undefined,
        },
      })
      .then((res) => setData(res.data as MessageLog[]));

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
      const res = await api.delete('/logs/messages', {
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
        <input placeholder="Filtrar Tipo" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
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
            <th>Fecha</th><th>Phone ID</th><th>From</th><th>Tipo</th><th>Contenido</th><th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{new Date(item.received_at).toLocaleString()}</td>
              <td>{item.phone_number_id}</td>
              <td>{item.from}</td>
              <td>{item.message_type}</td>
              <td>{item.message_content}</td>
              <td><button className="secondary" onClick={() => setSelected(item)}>Ver payload</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle de mensaje</h3>
            <pre>{JSON.stringify(selected.raw_payload, null, 2)}</pre>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar logs entrantes por rango</h3>
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
