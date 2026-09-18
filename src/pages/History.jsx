import { useMemo, useState } from "react";
import Button from "../components/Button";
import DateRangeFilter from "../components/DateRangeFilter";
import ReadingsChart from "../components/ReadingsChart";
import ReadingsTable from "../components/ReadingsTable";
import SectionTitle from "../components/SectionTitle";
import { getCurrentUser } from "../services/authService";
import { useVitalsSource } from "../services/vitalsSource";
import { isInRange } from "../utils/date";
import { exportCSV, exportJSON } from "../utils/exporters";

const METRICS = [
  { value: "hr", label: "HR" },
  { value: "temp", label: "Temp" },
  { value: "spo2", label: "SpO2" },
  { value: "rr", label: "RR" },
];

export default function History() {
  const user = getCurrentUser();
  const { readings, thresholds } = useVitalsSource(user?.id || "guest", {
    autoStart: false,
  });
  const [range, setRange] = useState({ start: "", end: "" });
  const [metric, setMetric] = useState("hr");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    return readings.filter((reading) =>
      isInRange(reading.timestampISO, range.start, range.end)
    );
  }, [readings, range]);

  if (!user) return null;

  const handleExportJSON = () => {
    exportJSON(`ihs-historial-${Date.now()}.json`, filtered);
    setMessage("Archivo JSON listo para descarga.");
  };

  const handleExportCSV = () => {
    const rows = filtered.map((reading) => ({
      fecha: reading.timestampISO,
      hr: reading.hr,
      temp: reading.temp,
      spo2: reading.spo2,
      rr: reading.rr,
      activity: reading.context?.activity || "",
      stress: reading.context?.stress || "",
      source: reading.source,
    }));
    exportCSV(`ihs-historial-${Date.now()}.csv`, rows);
    setMessage("Archivo CSV listo para descarga.");
  };

  return (
    <div className="space-y-6 pb-24">
      <SectionTitle
        title="Historial de lecturas"
        subtitle="Filtra por fecha y centra la vista en la métrica que quieras revisar."
      />

      <div className="card-surface space-y-4 p-4">
        <DateRangeFilter start={range.start} end={range.end} onChange={setRange} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted">Metrica</label>
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value)}
              className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
            >
              {METRICS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="w-full sm:w-auto">
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="w-full sm:w-auto">
              Exportar JSON
            </Button>
          </div>
        </div>
        {message && <p className="text-xs text-accent">{message}</p>}
      </div>

      <SectionTitle title={`Grafica ${metric.toUpperCase()}`} />
      <ReadingsChart readings={filtered} metric={metric} />

      <SectionTitle title="Tabla de lecturas" />
      <ReadingsTable readings={filtered} thresholds={thresholds} highlightMetric={metric} />
    </div>
  );
}
