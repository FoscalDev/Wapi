import { useEffect, useState } from 'react';
import api from '../services/api';

type WebhookSettings = {
  verify_token: string;
  app_secret: string;
};

export const WebhookSettingsPage = () => {
  const [form, setForm] = useState<WebhookSettings>({ verify_token: '', app_secret: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
  const callbackUrl = `${apiBaseUrl.replace(/\/api$/, '')}/api/webhook/meta`;

  const load = async () => {
    const res = await api.get('/settings/webhook');
    setForm({
      verify_token: res.data.verify_token ?? '',
      app_secret: res.data.app_secret ?? '',
    });
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings/webhook', form);
      setMessage('Ajustes guardados correctamente.');
    } catch {
      setMessage('No se pudieron guardar los ajustes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Ajustes Webhook Meta</h3>
      <p>Configura aqui el token de verificacion y el app secret usados por el webhook.</p>
      <div
        style={{
          border: '1px solid #bae6fd',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          background: '#f0f9ff',
        }}
      >
        <p style={{ marginTop: 0 }}>
          <strong>URL que debes configurar en Meta (Callback URL):</strong>
        </p>
        <input value={callbackUrl} readOnly style={{ width: '100%' }} />
        <p style={{ marginBottom: 0 }}>
          Verify token en Meta debe coincidir con <strong>META_VERIFY_TOKEN</strong>.
        </p>
      </div>
      <div className="filters">
        <input
          placeholder="META_VERIFY_TOKEN"
          value={form.verify_token}
          onChange={(e) => setForm({ ...form, verify_token: e.target.value })}
        />
        <input
          placeholder="META_APP_SECRET"
          value={form.app_secret}
          onChange={(e) => setForm({ ...form, app_secret: e.target.value })}
        />
      </div>
      <button onClick={() => void save()} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar ajustes'}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
};
