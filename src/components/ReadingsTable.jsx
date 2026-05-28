import Badge from "./Badge";
import Card from "./Card";
import { formatDateTime } from "../utils/formatters";

const SOURCE_LABELS = {
  device: "Dispositivo",
  manual: "Manual",
  demo: "Demo",
  api: "API",
};

function formatContext(context) {
  if (!context) return "-";
  const parts = [context.activity, context.stress].filter(Boolean);
  const flags = context.flags
    ? Object.entries(context.flags)
        .filter(([, active]) => active)
        .map(([key]) => key)
    : [];
  return [...parts, ...flags].join(" · ") || "-";
}

export default function ReadingsTable({ readings, limit, thresholds, highlightMetric = "hr" }) {
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
            <th className="px-4 py-3">HR</th>
            <th className="px-4 py-3">Temp</th>
            <th className="px-4 py-3">SpO2</th>
            <th className="px-4 py-3">RR</th>
            <th className="px-4 py-3">Contexto</th>
            <th className="px-4 py-3">Origen</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((reading) => {
            const outOfRange =
              thresholds &&
              (reading.hr < thresholds.hrMin ||
                reading.hr > thresholds.hrMax ||
                reading.temp < thresholds.tempMin ||
                reading.temp > thresholds.tempMax ||
                (reading.spo2 !== null && reading.spo2 < thresholds.spo2Min));

            const highlight = (metric) =>
              metric === highlightMetric ? "bg-accent/10 text-ink font-semibold" : "";

            return (
              <tr key={reading.id} className="border-t border-ink/10">
                <td className="px-4 py-3 text-ink">
                  {formatDateTime(reading.timestampISO)}
                </td>
                <td className={`px-4 py-3 ${highlight("hr")}`}>
                  {reading.hr ?? "-"} bpm
                </td>
                <td className={`px-4 py-3 ${highlight("temp")}`}>
                  {reading.temp ?? "-"} C
                </td>
                <td className={`px-4 py-3 ${highlight("spo2")}`}>
                  {reading.spo2 ?? "-"}%
                </td>
                <td className={`px-4 py-3 ${highlight("rr")}`}>
                  {reading.rr ?? "-"}
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatContext(reading.context)}
                </td>
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
