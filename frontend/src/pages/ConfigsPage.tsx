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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    app_name: '',
    phone_number_id: '',
    display_phone_number: '',
    webhook_url: '',
    auth_type: 'NONE' as 'NONE' | 'BEARER' | 'API_KEY',
    auth_token: '',
    is_active: true,
  });
  const [testResult, setTestResult] = useState<null | {
    configName: string;
    success: boolean;
    http_status: number;
    latency_ms: number;
    response_body?: unknown;
    error_message?: string;
  }>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

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

  const startEdit = (item: WhatsappConfig) => {
    setEditingId(item._id);
    setEditForm({
      app_name: item.app_name,
      phone_number_id: item.phone_number_id,
      display_phone_number: item.display_phone_number,
      webhook_url: item.webhook_url,
      auth_type: item.auth_type,
      auth_token: item.auth_token ?? '',
      is_active: item.is_active,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await api.patch(`/configs/${editingId}`, editForm);
    setEditingId(null);
    await load();
  };

  const testWebhook = async (item: WhatsappConfig) => {
    setTestingId(item._id);
    try {
      const res = await api.post(`/configs/${item._id}/test-webhook`);
      setTestResult({
        configName: item.app_name,
        ...(res.data as {
          success: boolean;
          http_status: number;
          latency_ms: number;
          response_body?: unknown;
          error_message?: string;
        }),
      });
    } catch (error) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string } | string;
        };
        message?: string;
      };
      const maybeData = err.response?.data;
      const errorMessage =
        typeof maybeData === 'string'
          ? maybeData
          : maybeData?.message || maybeData?.error || err.message || 'Error desconocido';
      setTestResult({
        configName: item.app_name,
        success: false,
        http_status: err.response?.status ?? 0,
        latency_ms: 0,
        error_message: errorMessage,
        response_body: maybeData ?? null,
      });
    } finally {
      setTestingId(null);
    }
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
                <td>
                  {editingId === item._id ? (
                    <input
                      value={editForm.app_name}
                      onChange={(e) => setEditForm({ ...editForm, app_name: e.target.value })}
                    />
                  ) : (
                    item.app_name
                  )}
                </td>
                <td>
                  {editingId === item._id ? (
                    <input
                      value={editForm.phone_number_id}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone_number_id: e.target.value })
                      }
                    />
                  ) : (
                    item.phone_number_id
                  )}
                </td>
                <td>
                  {editingId === item._id ? (
                    <input
                      value={editForm.display_phone_number}
                      onChange={(e) =>
                        setEditForm({ ...editForm, display_phone_number: e.target.value })
                      }
                    />
                  ) : (
                    item.display_phone_number
                  )}
                </td>
                <td>
                  {editingId === item._id ? (
                    <input
                      value={editForm.webhook_url}
                      onChange={(e) => setEditForm({ ...editForm, webhook_url: e.target.value })}
                    />
                  ) : (
                    item.webhook_url
                  )}
                </td>
                <td>
                  {editingId === item._id ? (
                    <select
                      value={String(editForm.is_active)}
                      onChange={(e) =>
                        setEditForm({ ...editForm, is_active: e.target.value === 'true' })
                      }
                    >
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </select>
                  ) : (
                    <span className={`badge ${item.is_active ? 'success' : 'failed'}`}>
                      {item.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === item._id ? (
                    <>
                      <button className="secondary" onClick={() => void saveEdit()}>
                        Guardar
                      </button>{' '}
                      <button onClick={() => setEditingId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="secondary" onClick={() => startEdit(item)}>
                        Editar
                      </button>{' '}
                      <button
                        className="secondary"
                        onClick={() => void testWebhook(item)}
                        disabled={testingId === item._id}
                      >
                        {testingId === item._id ? 'Probando...' : 'Probar webhook'}
                      </button>{' '}
                      <button className="secondary" onClick={() => void toggle(item)}>
                        Toggle
                      </button>{' '}
                      <button onClick={() => void remove(item._id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {testResult && (
        <div className="modal-backdrop" onClick={() => setTestResult(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Resultado prueba webhook</h3>
            <p><strong>Aplicacion:</strong> {testResult.configName}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <span className={`badge ${testResult.success ? 'success' : 'failed'}`}>
                {testResult.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </p>
            <p><strong>HTTP:</strong> {testResult.http_status}</p>
            <p><strong>Latencia:</strong> {testResult.latency_ms} ms</p>
            {testResult.error_message ? <p><strong>Error:</strong> {testResult.error_message}</p> : null}
            <pre>{JSON.stringify(testResult.response_body ?? {}, null, 2)}</pre>
            <button onClick={() => setTestResult(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};
