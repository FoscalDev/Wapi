import { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardSummary } from '../types';

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void api
      .get('/dashboard/summary')
      .then((res) => setData(res.data as DashboardSummary))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="panel">Cargando dashboard...</div>;
  if (!data) return <div className="panel">No hay datos disponibles.</div>;

  const successRate =
    data.incoming_messages === 0
      ? 0
      : Math.round((data.routing_success / data.incoming_messages) * 100);

  return (
    <>
      <div className="card-grid">
        <div className="card">
          <div className="kpi-label">Mensajes Entrantes</div>
          <div className="kpi-value">{data.incoming_messages}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Ruteos Exitosos</div>
          <div className="kpi-value">{data.routing_success}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Ruteos Fallidos</div>
          <div className="kpi-value">{data.routing_failed}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Latencia Promedio</div>
          <div className="kpi-value">{Math.round(data.avg_latency_ms)} ms</div>
        </div>
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Salud Operativa</h3>
        <p>Tasa de exito global: <strong>{successRate}%</strong></p>
      </div>
    </>
  );
};
