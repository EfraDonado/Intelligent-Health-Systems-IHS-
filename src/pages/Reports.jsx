import { useMemo, useState } from "react";
import AlertsList from "../components/AlertsList";
import Badge from "../components/Badge";
import Button from "../components/Button";
import DateRangeFilter from "../components/DateRangeFilter";
import ReadingsChart from "../components/ReadingsChart";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { getCurrentUser } from "../services/authService";
import { buildReportData, generatePDF } from "../services/reportService";
import { useVitalsSource } from "../services/vitalsSource";
import { copyText } from "../utils/clipboard";
import { nanoid } from "nanoid";
import { isInRange } from "../utils/date";

export default function Reports() {
  const user = getCurrentUser();
  const { readings, alerts, baseline, recommendations } = useVitalsSource(
    user?.id || "guest",
    { autoStart: false }
  );
  const [range, setRange] = useState({ start: "", end: "" });
  const [message, setMessage] = useState("");

  const recommendationItems = useMemo(() => {
    return (recommendations || []).map((item, index) => {
      if (!item || typeof item === "string") {
        return {
          id: `rec-${index}`,
          title: "Sugerencia",
          summary: item || "",
          steps: [],
          priority: "low",
          timeframe: "",
        };
      }

      return {
        id: item.id || `rec-${index}`,
        title: item.title || "Sugerencia",
        summary: item.summary || "",
        steps: item.steps || [],
        priority: item.priority || "low",
        timeframe: item.timeframe || "",
        followUp: item.followUp || "",
      };
    });
  }, [recommendations]);

  const priorityLabels = {
    high: "Atencion",
    medium: "Seguimiento",
    low: "Sugerencia",
  };

  const priorityBadges = {
    high: "alert",
    medium: "new",
    low: "info",
  };

  const filteredReadings = useMemo(() => {
    return readings.filter((reading) =>
      isInRange(reading.timestampISO, range.start, range.end)
    );
  }, [readings, range]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) =>
      isInRange(alert.timestampISO, range.start, range.end)
    );
  }, [alerts, range]);

  const reportData = useMemo(
    () => buildReportData(filteredReadings, filteredAlerts, baseline),
    [filteredReadings, filteredAlerts, baseline]
  );

  if (!user) return null;

  const handleGeneratePDF = () => {
    generatePDF({
      user,
      period: range,
      readings: filteredReadings,
      alerts: filteredAlerts,
      stats: reportData.stats,
      recommendations,
    });
  };

  const handleShare = async () => {
    const link = `https://ihs.local/share/${nanoid(8)}`;
    const ok = await copyText(link);
    setMessage(ok ? `Link copiado: ${link}` : "No se pudo copiar el link.");
  };

  return (
    <div className="space-y-6 pb-24">
      <SectionTitle
        title="Reportes"
        subtitle="Selecciona un periodo y genera un resumen facil de leer."
      />

      <div className="card-surface space-y-4 p-4">
        <DateRangeFilter start={range.start} end={range.end} onChange={setRange} />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button onClick={handleGeneratePDF} className="w-full sm:w-auto">
            Generar PDF
          </Button>
          <Button variant="outline" onClick={handleShare} className="w-full sm:w-auto">
            Compartir
          </Button>
          {message && <p className="text-xs text-accent">{message}</p>}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
        <StatCard
          className="min-w-[220px] md:min-w-0"
          label="Alertas en periodo"
          value={reportData.alertCount}
          hint="Incluye nuevas, revisadas y de tendencia"
        />
        <StatCard
          className="min-w-[220px] md:min-w-0"
          label="HR promedio"
          value={reportData.stats.hr.avg !== null ? `${reportData.stats.hr.avg.toFixed(0)} bpm` : "-"}
          hint="Rango total del periodo"
        />
        <StatCard
          className="min-w-[220px] md:min-w-0"
          label="Temp promedio"
          value={reportData.stats.temp.avg !== null ? `${reportData.stats.temp.avg.toFixed(1)} C` : "-"}
          hint="Rango total del periodo"
        />
        <StatCard
          className="min-w-[220px] md:min-w-0"
          label="SpO2 promedio"
          value={reportData.stats.spo2.avg !== null ? `${reportData.stats.spo2.avg.toFixed(0)}%` : "-"}
          hint={reportData.stats.rr.avg !== null ? `RR promedio: ${reportData.stats.rr.avg.toFixed(0)} rpm` : "RR no disponible en este periodo"}
        />
      </div>

      <SectionTitle title="Grafica resumen" />
      <ReadingsChart readings={filteredReadings} metric="hr" />

      <SectionTitle title="Alertas del periodo" />
      <AlertsList alerts={filteredAlerts} readOnly />

      <SectionTitle title="Recomendaciones" />
      <div className="grid gap-3">
        {recommendationItems.map((rec) => (
          <div key={rec.id} className="card-surface space-y-2 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{rec.title}</p>
              {rec.priority && (
                <Badge variant={priorityBadges[rec.priority] || "neutral"}>
                  {priorityLabels[rec.priority] || "Info"}
                </Badge>
              )}
            </div>
            {rec.summary && <p className="text-sm text-ink/80">{rec.summary}</p>}
            {rec.steps?.length > 0 && (
              <ol className="list-decimal space-y-1 pl-5 text-sm text-ink/80">
                {rec.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            )}
            {rec.timeframe && (
              <p className="text-xs text-muted">Cuando: {rec.timeframe}</p>
            )}
            {rec.followUp && (
              <p className="text-xs text-muted">Si continua: {rec.followUp}</p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">Apoyo informativo, no diagnostico.</p>
    </div>
  );
}
