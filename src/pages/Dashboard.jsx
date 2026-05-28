import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import DeviceSimulator from "../components/DeviceSimulator";
import ReadingsTable from "../components/ReadingsTable";
import ReadingsChart from "../components/ReadingsChart";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { getCurrentUser } from "../services/authService";
import { seedDemoData } from "../services/demoDataService";
import { useVitalsSource } from "../services/vitalsSource";
import { formatDateTime } from "../utils/formatters";

function formatDelta(value, suffix = "") {
  if (value === null || value === undefined) return "-";
  const sign = value > 0 ? "+" : "";
  const digits = suffix === "%" || suffix === "bpm" ? 0 : 1;
  return `${sign}${Number(value).toFixed(digits)}${suffix}`;
}

const PRIORITY_LABELS = {
  high: "Atencion",
  medium: "Seguimiento",
  low: "Sugerencia",
};

const PRIORITY_BADGES = {
  high: "alert",
  medium: "new",
  low: "info",
};

function normalizeRecommendation(item, index) {
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
}

export default function Dashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const {
    source,
    latestReading,
    recentReadings,
    thresholds,
    baseline,
    baselineDelta,
    reminder,
    recommendations,
    recommendationDisclaimer,
    mode,
    connected,
    sourceLabel,
    newAlertsCount,
  } = useVitalsSource(user?.id || "guest", { autoStart: true });
  const [reminderDraft, setReminderDraft] = useState({
    enabled: reminder.enabled,
    everyHours: reminder.everyHours,
    note: reminder.note,
  });

  useEffect(() => {
    setReminderDraft({
      enabled: reminder.enabled,
      everyHours: reminder.everyHours,
      note: reminder.note,
    });
  }, [reminder.enabled, reminder.everyHours, reminder.note]);

  const handleGenerate = ({ scenario, context }) => {
    source.generateAndStoreReading({
      scenario,
      context,
      source: mode,
    });
  };

  const handleManualAdd = ({ hr, temp, spo2, rr, context }) => {
    source.addManualReading({
      hr,
      temp,
      spo2,
      rr,
      context,
    });
  };

  const handleLoadDemo = () => {
    seedDemoData(user.id);
    source.refresh();
  };

  const handleReminderSave = () => {
    source.setReminder(reminderDraft);
  };

  const baselineSummary = useMemo(() => {
    if (!baseline?.samples) {
      return "Aun no hay suficientes lecturas en reposo para crear tu linea base.";
    }

    return `HR ${baseline.hr.avg?.toFixed(0) || "-"} bpm · Temp ${baseline.temp.avg?.toFixed(1) || "-"} C · SpO2 ${baseline.spo2.avg?.toFixed(0) || "-"}%`;
  }, [baseline]);

  if (!user) return null;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Hola, {user.name}</p>
          <h1 className="text-2xl font-semibold text-ink">
            Resumen de tu seguimiento hoy
          </h1>
          <p className="text-sm text-muted">
            Fuente activa: {sourceLabel} · {connected ? "conectada" : "detenida"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={connected ? "normal" : "alert"}>
            {connected ? "Fuente activa" : "Fuente detenida"}
          </Badge>
          <Badge variant="info">Alertas nuevas: {newAlertsCount}</Badge>
        </div>
      </div>

      {reminder.due && (
        <Card className="border-accent/25 bg-accent/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">Recordatorio suave</p>
              <p className="text-sm text-muted">
                {reminder.message || "Ya toca registrar una lectura nueva."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => source.acknowledgeReminder()}>
              Ya lo vi
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ultima lectura"
          value={latestReading ? `${latestReading.hr ?? "-"} bpm` : "Sin datos"}
          hint={latestReading ? `Temp ${latestReading.temp ?? "-"} C · SpO2 ${latestReading.spo2 ?? "-"}%` : "Aun no hay lecturas"}
        />
        <StatCard
          label="Temperatura"
          value={latestReading?.temp !== null && latestReading?.temp !== undefined ? `${latestReading.temp} C` : "-"}
          hint={latestReading ? `Actualizado ${formatDateTime(latestReading.timestampISO)}` : ""}
        />
        <StatCard
          label="SpO2"
          value={latestReading?.spo2 !== null && latestReading?.spo2 !== undefined ? `${latestReading.spo2}%` : "-"}
          hint={latestReading?.spo2 !== null && latestReading?.spo2 !== undefined ? `Minimo sugerido ${thresholds.spo2Min}%` : "La lectura aun no trae oxigenacion"}
        />
        <StatCard
          label="RR estimada"
          value={latestReading?.rr !== null && latestReading?.rr !== undefined ? `${latestReading.rr} rpm` : "No disponible"}
          hint="En modo API puede venir vacia sin romper la vista"
        />
      </div>

      <SectionTitle
        title="Linea base de 7 dias"
        subtitle="Solo usa lecturas en reposo para que la comparacion sea mas justa."
        action={
          <Badge variant="neutral">
            {baseline?.samples ? `${baseline.samples} muestras` : "Sin linea base aun"}
          </Badge>
        }
      />
      <Card className="space-y-3">
        <p className="text-sm text-ink/80">{baselineSummary}</p>
        {baselineDelta && (
          <div className="grid gap-2 text-sm text-muted md:grid-cols-4">
            <span>HR vs base: {formatDelta(baselineDelta.hr, "bpm")}</span>
            <span>Temp vs base: {formatDelta(baselineDelta.temp, " C")}</span>
            <span>SpO2 vs base: {formatDelta(baselineDelta.spo2, "%")}</span>
            <span>RR vs base: {formatDelta(baselineDelta.rr, " rpm")}</span>
          </div>
        )}
      </Card>

      <SectionTitle
        title="Simulador y captura"
        subtitle="Conecta la fuente, genera una lectura o carga datos demo para practicar."
      />
      <DeviceSimulator
        connected={connected}
        onToggle={() => source.toggleConnected()}
        onGenerate={handleGenerate}
        onManualAdd={handleManualAdd}
        thresholds={thresholds}
        sourceMode={mode}
        onModeChange={(nextMode) => source.setMode(nextMode)}
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleLoadDemo}>
          Cargar datos demo
        </Button>
        <Button variant="ghost" onClick={() => navigate("/manual")}>Abrir manual</Button>
      </div>

      <SectionTitle
        title="Recordatorios"
        subtitle="Una ayuda simple para no dejar pasar mucho tiempo entre lecturas."
      />
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-muted">
            Activar recordatorio
            <select
              value={String(reminderDraft.enabled)}
              onChange={(event) =>
                setReminderDraft((prev) => ({
                  ...prev,
                  enabled: event.target.value === "true",
                }))
              }
              className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="false">No</option>
              <option value="true">Si</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Cada cuantas horas
            <input
              type="number"
              min="1"
              max="24"
              value={reminderDraft.everyHours}
              onChange={(event) =>
                setReminderDraft((prev) => ({
                  ...prev,
                  everyHours: event.target.value,
                }))
              }
              className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Mensaje corto
            <input
              value={reminderDraft.note}
              onChange={(event) =>
                setReminderDraft((prev) => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
              className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleReminderSave}>Guardar recordatorio</Button>
          <p className="text-xs text-muted">
            Si se cumple el tiempo, veras una banda interna para recordarte la lectura.
          </p>
        </div>
      </Card>

      <SectionTitle
        title="Lecturas recientes"
        subtitle="Ultimas 5 lecturas registradas con contexto y oxigenacion."
      />
      <ReadingsTable readings={recentReadings} limit={5} thresholds={thresholds} highlightMetric="hr" />

      <SectionTitle
        title="Tendencia rapida"
        subtitle="Una vista simple para seguir la lectura que quieras revisar primero."
      />
      <ReadingsChart readings={recentReadings} metric="hr" />

      <SectionTitle title="Recomendaciones" />
      <div className="grid gap-3">
        {(recommendations || []).map((item, index) => {
          const rec = normalizeRecommendation(item, index);
          return (
            <div key={rec.id} className="card-surface space-y-2 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{rec.title}</p>
                {rec.priority && (
                  <Badge variant={PRIORITY_BADGES[rec.priority] || "neutral"}>
                    {PRIORITY_LABELS[rec.priority] || "Info"}
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
          );
        })}
      </div>
      <p className="text-xs text-muted">{recommendationDisclaimer || "Apoyo informativo, no diagnostico."}</p>
    </div>
  );
}
