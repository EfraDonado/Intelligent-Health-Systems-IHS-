import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import { formatDateTime } from "../utils/formatters";

const PARAM_LABEL = {
  hr: "HR",
  temp: "Temp",
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
                {PARAM_LABEL[alert.parameter] || "Parametro"} fuera de rango
              </p>
              <Badge variant={alert.status === "new" ? "new" : "reviewed"}>
                {alert.status === "new" ? "Nueva" : "Revisada"}
              </Badge>
            </div>
            <p className="text-xs text-muted">
              Valor {alert.value} | Rango {alert.min}-{alert.max}
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
