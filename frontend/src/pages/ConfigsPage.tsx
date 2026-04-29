import { useEffect, useState } from 'react';
import api from '../services/api';
import { WhatsappConfig } from '../types';

const emptyForm = {
  app_name: '',
  phone_number_id: '',
  display_phone_number: '',
  webhook_url: '',
  auth_type: 'NONE',
  auth_token: '',
  is_active: true,
};

export const ConfigsPage = () => {
  const [data, setData] = useState<WhatsappConfig[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/configs').then((res) => {
      setData(res.data as WhatsappConfig[]);
      setLoading(false);
    });

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    await api.post('/configs', form);
    setForm(emptyForm);
    await load();
  };

  const toggle = async (item: WhatsappConfig) => {
    await api.patch(`/configs/${item._id}`, { is_active: !item.is_active });
    await load();
  };

  const remove = async (id: string) => {
    await api.delete(`/configs/${id}`);
    await load();
  };

  if (loading) return <div className="panel">Cargando configuraciones...</div>;

  return (
    <>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Nueva configuracion</h3>
        <div className="filters">
          <input placeholder="App Name" value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} />
          <input placeholder="Phone Number ID" value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} />
          <input placeholder="Display Phone" value={form.display_phone_number} onChange={(e) => setForm({ ...form, display_phone_number: e.target.value })} />
          <input placeholder="Webhook URL" value={form.webhook_url} onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} />
          <select value={form.auth_type} onChange={(e) => setForm({ ...form, auth_type: e.target.value as 'NONE' | 'BEARER' | 'API_KEY' })}>
            <option value="NONE">NONE</option>
            <option value="BEARER">BEARER</option>
            <option value="API_KEY">API_KEY</option>
          </select>
          <input placeholder="Auth Token" value={form.auth_token} onChange={(e) => setForm({ ...form, auth_token: e.target.value })} />
          <button onClick={() => void create()}>Crear</button>
        </div>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>App</th><th>Phone ID</th><th>Display</th><th>Webhook</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>{item.app_name}</td>
                <td>{item.phone_number_id}</td>
                <td>{item.display_phone_number}</td>
                <td>{item.webhook_url}</td>
                <td>
                  <span className={`badge ${item.is_active ? 'success' : 'failed'}`}>
                    {item.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <button className="secondary" onClick={() => void toggle(item)}>Toggle</button>{' '}
                  <button onClick={() => void remove(item._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
