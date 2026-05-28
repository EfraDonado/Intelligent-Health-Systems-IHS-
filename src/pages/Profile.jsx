import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import { deleteAccount, getCurrentUser, logout } from "../services/authService";
import { useVitalsSource } from "../services/vitalsSource";
import { exportJSON } from "../utils/exporters";

export default function Profile() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { readings, alerts, thresholds, reminder, mode, sourceLabel } = useVitalsSource(
    user?.id || "guest",
    { autoStart: false }
  );

  if (!user) return null;

  const handleExport = () => {
    exportJSON(`ihs-datos-${user.id}.json`, {
      user,
      readings,
      alerts,
      thresholds,
      reminder,
      sourceMode: mode,
      sourceLabel,
    });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Seguro que deseas eliminar tu cuenta? Esta accion es local."
    );
    if (!confirmDelete) return;
    deleteAccount(user.id);
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 pb-24">
      <SectionTitle
        title="Perfil"
        subtitle="Gestiona tu cuenta y exporta tus datos locales cuando lo necesites."
      />

      <Card className="space-y-3">
        <div>
          <p className="text-xs text-muted">Nombre</p>
          <p className="text-base text-ink">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Correo</p>
          <p className="text-base text-ink">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Fuente activa</p>
          <p className="text-base text-ink">{sourceLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Recordatorio</p>
          <p className="text-base text-ink">
            {reminder.enabled ? `Cada ${reminder.everyHours} horas` : "Desactivado"}
          </p>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExport}>Exportar datos (JSON)</Button>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>Volver al panel</Button>
        <Button variant="danger" onClick={handleDelete}>
          Eliminar cuenta (simulado)
        </Button>
      </div>
    </div>
  );
}
