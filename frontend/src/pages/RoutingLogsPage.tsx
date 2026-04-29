import { useEffect, useState } from 'react';
import api from '../services/api';
import { RoutingLog } from '../types';

export const RoutingLogsPage = () => {
  const [data, setData] = useState<RoutingLog[]>([]);
  const [selected, setSelected] = useState<RoutingLog | null>(null);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
              <td><button className="secondary" onClick={() => setSelected(item)}>Ver respuesta</button></td>
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
            <pre>{JSON.stringify(selected.response_body ?? {}, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
