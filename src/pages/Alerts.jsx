import { useEffect, useMemo, useState } from "react";
import AlertsList from "../components/AlertsList";
import SectionTitle from "../components/SectionTitle";
import { getCurrentUser } from "../services/authService";
import { listByUser, markReviewed } from "../services/alertsService";

export default function Alerts() {
  const user = getCurrentUser();
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("all");
  const [parameter, setParameter] = useState("all");

  const refresh = () => {
    setAlerts(listByUser(user.id));
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      const matchStatus = status === "all" || alert.status === status;
      const matchParam = parameter === "all" || alert.parameter === parameter;
      return matchStatus && matchParam;
    });
  }, [alerts, status, parameter]);

  const handleReview = (id) => {
    markReviewed(id);
    refresh();
  };

  return (
    <div className="space-y-6 pb-20">
      <SectionTitle
        title="Alertas"
        subtitle="Filtra y marca alertas como revisadas cuando termines."
      />

      <div className="card-surface flex flex-wrap items-center gap-3 p-4">
        <label className="text-sm text-muted">Estado</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todas</option>
          <option value="new">Nuevas</option>
          <option value="reviewed">Revisadas</option>
        </select>
        <label className="ml-4 text-sm text-muted">Parametro</label>
        <select
          value={parameter}
          onChange={(event) => setParameter(event.target.value)}
          className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="all">Todos</option>
          <option value="hr">HR</option>
          <option value="temp">Temp</option>
        </select>
      </div>

      <AlertsList alerts={filtered} onMarkReviewed={handleReview} />

      <p className="text-xs text-muted">
        Recuerda: esto es apoyo, no diagnostico medico.
      </p>
    </div>
  );
}
