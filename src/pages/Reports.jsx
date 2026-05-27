import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import DateRangeFilter from "../components/DateRangeFilter";
import AlertsList from "../components/AlertsList";
import ReadingsChart from "../components/ReadingsChart";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { getCurrentUser } from "../services/authService";
import { listByUserInRange as listAlertsRange } from "../services/alertsService";
import { generateRecommendations } from "../services/aiService";
import { listByUserInRange as listReadingsRange } from "../services/readingsService";
import { buildReportData, generatePDF } from "../services/reportService";
import { getThresholds } from "../services/thresholdsService";
import { copyText } from "../utils/clipboard";
import { nanoid } from "nanoid";

export default function Reports() {
  const user = getCurrentUser();
  const [range, setRange] = useState({ start: "", end: "" });
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");
  const [thresholds, setThresholds] = useState(() => getThresholds(user.id));

  useEffect(() => {
    setReadings(listReadingsRange(user.id, range.start, range.end));
    setAlerts(listAlertsRange(user.id, range.start, range.end));
    setThresholds(getThresholds(user.id));
  }, [range.start, range.end]);

  const reportData = useMemo(
    () => buildReportData(readings, alerts),
    [readings, alerts]
  );

  const recommendations = useMemo(
    () => generateRecommendations(readings, alerts, thresholds),
    [readings, alerts, thresholds]
  );

  const handleGeneratePDF = () => {
    generatePDF({
      user,
      period: range,
      readings,
      alerts,
      stats: reportData.stats,
      recommendations,
    });
  };

  const handleShare = async () => {
    const link = `https://saludia.app/share/${nanoid(8)}`;
    const ok = await copyText(link);
    setMessage(ok ? `Link copiado: ${link}` : "No se pudo copiar el link.");
  };

  return (
    <div className="space-y-6 pb-20">
      <SectionTitle
        title="Reportes"
        subtitle="Selecciona un periodo para generar tu resumen." 
      />

      <div className="card-surface space-y-4 p-4">
        <DateRangeFilter
          start={range.start}
          end={range.end}
          onChange={setRange}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleGeneratePDF}>Generar PDF</Button>
          <Button variant="outline" onClick={handleShare}>
            Compartir
          </Button>
          {message && <p className="text-xs text-accent">{message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Alertas en periodo"
          value={reportData.alertCount}
          hint="Incluye nuevas y revisadas"
        />
        <StatCard
          label="HR promedio"
          value={
            reportData.stats.hr.avg !== null
              ? `${reportData.stats.hr.avg.toFixed(0)} bpm`
              : "-"
          }
          hint="Rango total del periodo"
        />
        <StatCard
          label="Temp promedio"
          value={
            reportData.stats.temp.avg !== null
              ? `${reportData.stats.temp.avg.toFixed(1)} C`
              : "-"
          }
          hint="Rango total del periodo"
        />
      </div>

      <SectionTitle title="Grafica resumen" />
      <ReadingsChart readings={readings} />

      <SectionTitle title="Alertas del periodo" />
      <AlertsList alerts={alerts} readOnly />

      <SectionTitle title="Recomendaciones" />
      <div className="grid gap-3">
        {recommendations.map((tip, index) => (
          <div
            key={index}
            className="card-surface flex items-center gap-3 px-4 py-3"
          >
            <span className="text-sm text-ink">{tip}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">
        Apoyo informativo, no diagnostico medico.
      </p>
    </div>
  );
}
