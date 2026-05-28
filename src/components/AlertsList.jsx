import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import { formatDateTime } from "../utils/formatters";

const PARAM_LABEL = {
  hr: "HR",
  temp: "Temp",
  spo2: "SpO2",
  trend: "Tendencia",
};

export default function AlertsList({ alerts, onMarkReviewed, readOnly = false }) {
  if (!alerts.length) {
    return (
      <Card className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-muted">No hay alertas activas.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-ink">
                {PARAM_LABEL[alert.parameter] || "Parametro"}
              </p>
              <Badge variant={alert.kind === "trend" ? "info" : alert.status === "new" ? "new" : "reviewed"}>
                {alert.kind === "trend"
                  ? "Tendencia"
                  : alert.status === "new"
                    ? "Nueva"
                    : "Revisada"}
              </Badge>
              {alert.severity === "warning" && <Badge variant="alert">Importante</Badge>}
            </div>
            <p className="text-xs text-muted">
              {alert.kind === "trend"
                ? alert.note || "Tendencia detectada en lecturas recientes."
                : `Valor ${alert.value} | Rango ${alert.min}-${alert.max}`}
            </p>
          </div>
          <div className="text-xs text-muted">
            {formatDateTime(alert.timestampISO)}
          </div>
          {alert.status === "new" && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkReviewed(alert.id)}
            >
              Marcar revisada
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
