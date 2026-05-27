import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import { deleteAccount, getCurrentUser, logout } from "../services/authService";
import { listByUser as listAlerts } from "../services/alertsService";
import { listByUser as listReadings } from "../services/readingsService";
import { getThresholds } from "../services/thresholdsService";
import { exportJSON } from "../utils/exporters";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) return null;

  const handleExport = () => {
    const readings = listReadings(user.id);
    const alerts = listAlerts(user.id);
    const thresholds = getThresholds(user.id);
    exportJSON(`saludia-datos-${user.id}.json`, {
      user,
      readings,
      alerts,
      thresholds,
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
    <div className="space-y-6 pb-20">
      <SectionTitle
        title="Perfil"
        subtitle="Gestiona tu cuenta y exporta datos rapidos."
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
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExport}>Exportar datos (JSON)</Button>
        <Button variant="outline" onClick={() => navigate("/dashboard")}
        >
          Volver al panel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Eliminar cuenta (simulado)
        </Button>
      </div>
    </div>
  );
}
