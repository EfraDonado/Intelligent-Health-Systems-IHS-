import { useMemo, useState } from "react";
import AlertsList from "../components/AlertsList";
import SectionTitle from "../components/SectionTitle";
import { getCurrentUser } from "../services/authService";
import { useVitalsSource } from "../services/vitalsSource";

const PARAMETER_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "hr", label: "HR" },
  { value: "temp", label: "Temp" },
  { value: "spo2", label: "SpO2" },
  { value: "trend", label: "Tendencias" },
];

export default function Alerts() {
  const user = getCurrentUser();
  const { alerts, source } = useVitalsSource(user?.id || "guest", {
    autoStart: false,
  });
  const [status, setStatus] = useState("all");
  const [parameter, setParameter] = useState("all");

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      const matchStatus = status === "all" || alert.status === status;
      const matchParam = parameter === "all" || alert.parameter === parameter || (parameter === "trend" && alert.kind === "trend");
      return matchStatus && matchParam;
    });
  }, [alerts, status, parameter]);

  if (!user) return null;

  const handleReview = (id) => {
    source.markAlertReviewed(id);
  };

  return (
    <div className="space-y-6 pb-24">
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
          {PARAMETER_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <AlertsList alerts={filtered} onMarkReviewed={handleReview} />

      <p className="text-xs text-muted">
        Recuerda: esto es apoyo, no diagnostico.
      </p>
    </div>
  );
}
