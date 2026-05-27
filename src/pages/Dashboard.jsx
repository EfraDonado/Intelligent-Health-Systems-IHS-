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
import { listByUser as listAlerts, countNew } from "../services/alertsService";
import { generateRecommendations } from "../services/aiService";
import { listByUser as listReadings, createReading } from "../services/readingsService";
import { getThresholds } from "../services/thresholdsService";
import { getJSON, setJSON } from "../services/storage";
import { generateRandomReading } from "../utils/random";
import { formatDateTime } from "../utils/formatters";

export default function Dashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState(() =>
    getThresholds(user.id)
  );
  const [connected, setConnected] = useState(() =>
    getJSON("deviceConnected", false)
  );

  const refreshData = () => {
    setReadings(listReadings(user.id));
    setAlerts(listAlerts(user.id));
    setThresholds(getThresholds(user.id));
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    setJSON("deviceConnected", connected);
  }, [connected]);

  const handleGenerate = (mode) => {
    const generated = generateRandomReading(thresholds, mode);
    createReading({
      userId: user.id,
      hr: generated.hr,
      temp: generated.temp,
      source: "device",
    });
    refreshData();
  };

  const handleManualAdd = ({ hr, temp }) => {
    createReading({ userId: user.id, hr, temp, source: "manual" });
    refreshData();
  };

  const lastReading = readings[0];
  const newAlerts = countNew(user.id);

  const recommendations = useMemo(
    () => generateRecommendations(readings, alerts, thresholds),
    [readings, alerts, thresholds]
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Hola, {user.name}</p>
          <h1 className="text-2xl font-semibold text-ink">
            Resumen de tu salud hoy
          </h1>
        </div>
        <Badge variant={connected ? "normal" : "alert"}>
          {connected ? "Dispositivo conectado" : "Dispositivo desconectado"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Ultima lectura"
          value={
            lastReading
              ? `${lastReading.hr} bpm / ${lastReading.temp} C`
              : "Sin datos"
          }
          hint={
            lastReading
              ? `Actualizado ${formatDateTime(lastReading.timestampISO)}`
              : "Aun no hay lecturas"
          }
        />
        <StatCard
          label="Alertas nuevas"
          value={newAlerts}
          hint="Revisa alertas para marcar como revisadas"
          badge={<Badge variant={newAlerts ? "new" : "reviewed"}>Live</Badge>}
        />
        <StatCard
          label="Umbrales activos"
          value={`${thresholds.hrMin}-${thresholds.hrMax} bpm / ${thresholds.tempMin}-${thresholds.tempMax} C`}
          hint="Puedes ajustarlos en la seccion Umbrales"
        />
      </div>

      <SectionTitle
        title="Guia rapida"
        subtitle="Si es tu primera vez, aqui tienes un resumen sencillo."
      />
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink/80">
            Aprende en 2 minutos: como generar lecturas, revisar alertas y crear
            reportes.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/manual")}
        >
          Abrir manual
        </Button>
      </Card>

      <SectionTitle
        title="Simulador"
        subtitle="Conecta tu dispositivo o usa el simulador para generar lecturas."
      />
      <DeviceSimulator
        connected={connected}
        onToggle={() => setConnected((prev) => !prev)}
        onGenerate={handleGenerate}
        onManualAdd={handleManualAdd}
        thresholds={thresholds}
      />

      <SectionTitle
        title="Lecturas recientes"
        subtitle="Ultimas 5 lecturas registradas."
      />
      <ReadingsTable readings={readings} limit={5} thresholds={thresholds} />

      <SectionTitle
        title="Tendencia rapida"
        subtitle="Vista compacta de tus lecturas mas recientes."
      />
      <ReadingsChart readings={readings} />

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
