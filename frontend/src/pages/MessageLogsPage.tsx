import { useEffect, useState } from 'react';
import api from '../services/api';
import { MessageLog } from '../types';

export const MessageLogsPage = () => {
  const [data, setData] = useState<MessageLog[]>([]);
  const [selected, setSelected] = useState<MessageLog | null>(null);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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

  return (
    <div className="panel">
      <div className="filters">
        <input placeholder="Filtrar Phone ID" value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} />
        <input placeholder="Filtrar Tipo" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
        <button onClick={() => void load()}>Aplicar filtros</button>
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
    </div>
  );
};
