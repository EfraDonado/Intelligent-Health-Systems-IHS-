import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import DateRangeFilter from "../components/DateRangeFilter";
import ReadingsChart from "../components/ReadingsChart";
import ReadingsTable from "../components/ReadingsTable";
import SectionTitle from "../components/SectionTitle";
import { getCurrentUser } from "../services/authService";
import { listByUser } from "../services/readingsService";
import { getThresholds } from "../services/thresholdsService";
import { isInRange } from "../utils/date";
import { exportCSV, exportJSON } from "../utils/exporters";

export default function History() {
  const user = getCurrentUser();
  const [readings, setReadings] = useState([]);
  const [thresholds, setThresholds] = useState(() =>
    getThresholds(user.id)
  );
  const [range, setRange] = useState({ start: "", end: "" });
  const [parameter, setParameter] = useState("both");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setReadings(listByUser(user.id));
    setThresholds(getThresholds(user.id));
  }, []);

  const filtered = useMemo(() => {
    return readings.filter((reading) =>
      isInRange(reading.timestampISO, range.start, range.end)
    );
  }, [readings, range]);

  const chartMode = parameter === "both" ? "both" : parameter;

  const handleExportJSON = () => {
    exportJSON(`saludia-historial-${Date.now()}.json`, filtered);
    setMessage("Archivo JSON listo para descarga.");
  };

  const handleExportCSV = () => {
    const rows = filtered.map((reading) => ({
      fecha: reading.timestampISO,
      hr: reading.hr,
      temp: reading.temp,
      origen: reading.source,
    }));
    exportCSV(`saludia-historial-${Date.now()}.csv`, rows);
    setMessage("Archivo CSV listo para descarga.");
  };

  return (
    <div className="space-y-6 pb-20">
      <SectionTitle
        title="Historial de lecturas"
        subtitle="Filtra por fecha o parametro para analizar tendencias."
      />

      <div className="card-surface space-y-4 p-4">
        <DateRangeFilter
          start={range.start}
          end={range.end}
          onChange={setRange}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-muted">Parametro</label>
          <select
            value={parameter}
            onChange={(event) => setParameter(event.target.value)}
            className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="both">HR + Temp</option>
            <option value="hr">HR</option>
            <option value="temp">Temp</option>
          </select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              Exportar JSON
            </Button>
          </div>
        </div>
        {message && <p className="text-xs text-accent">{message}</p>}
      </div>

      <SectionTitle title="Grafica" />
      <ReadingsChart readings={filtered} mode={chartMode} />

      <SectionTitle title="Tabla de lecturas" />
      <ReadingsTable readings={filtered} thresholds={thresholds} mode={chartMode} />
    </div>
  );
}
