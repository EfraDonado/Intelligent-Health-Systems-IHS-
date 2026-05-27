import Badge from "./Badge";
import Card from "./Card";
import { formatDateTime } from "../utils/formatters";

const SOURCE_LABELS = {
  device: "Dispositivo",
  manual: "Manual",
  demo: "Demo",
};

export default function ReadingsTable({ readings, limit, thresholds, mode = "both" }) {
  const items = limit ? readings.slice(0, limit) : readings;

  if (!items.length) {
    return (
      <Card className="flex min-h-[180px] items-center justify-center">
        <p className="text-sm text-muted">Sin lecturas aun.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead className="bg-ink/5 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            {(mode === "both" || mode === "hr") && (
              <th className="px-4 py-3">HR</th>
            )}
            {(mode === "both" || mode === "temp") && (
              <th className="px-4 py-3">Temp</th>
            )}
            <th className="px-4 py-3">Origen</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((reading) => {
            const outOfRange =
              thresholds &&
              ((mode !== "temp" &&
                (reading.hr < thresholds.hrMin ||
                  reading.hr > thresholds.hrMax)) ||
                (mode !== "hr" &&
                  (reading.temp < thresholds.tempMin ||
                    reading.temp > thresholds.tempMax)));
            return (
              <tr key={reading.id} className="border-t border-ink/10">
                <td className="px-4 py-3 text-ink">
                  {formatDateTime(reading.timestampISO)}
                </td>
                {(mode === "both" || mode === "hr") && (
                  <td className="px-4 py-3">{reading.hr} bpm</td>
                )}
                {(mode === "both" || mode === "temp") && (
                  <td className="px-4 py-3">{reading.temp} C</td>
                )}
                <td className="px-4 py-3 text-muted">
                  {SOURCE_LABELS[reading.source] || "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={outOfRange ? "alert" : "normal"}>
                    {outOfRange ? "Alerta" : "Normal"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
