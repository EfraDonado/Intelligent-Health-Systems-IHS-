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

  const highlightCell = (metric) =>
    metric === highlightMetric ? "bg-accent/10 text-ink font-semibold" : "";
  const highlightValue = (metric) =>
    metric === highlightMetric ? "text-accent font-semibold" : "text-ink";

  if (!items.length) {
    return (
      <Card className="flex min-h-[180px] items-center justify-center">
        <p className="text-sm text-muted">Sin lecturas aun.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-3 p-4 md:hidden">
        {items.map((reading) => {
          const outOfRange =
            thresholds &&
            (reading.hr < thresholds.hrMin ||
              reading.hr > thresholds.hrMax ||
              reading.temp < thresholds.tempMin ||
              reading.temp > thresholds.tempMax ||
              (reading.spo2 !== null && reading.spo2 < thresholds.spo2Min));

          return (
            <div
              key={reading.id}
              className="rounded-xl border border-ink/10 bg-white/80 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted">
                  {formatDateTime(reading.timestampISO)}
                </p>
                <Badge variant={outOfRange ? "alert" : "normal"}>
                  {outOfRange ? "Alerta" : "Normal"}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-ink/10 bg-ink/5 px-2 py-1">
                  <p className="text-[11px] text-muted">HR</p>
                  <p className={highlightValue("hr")}>
                    {reading.hr ?? "-"} bpm
                  </p>
                </div>
                <div className="rounded-lg border border-ink/10 bg-ink/5 px-2 py-1">
                  <p className="text-[11px] text-muted">Temp</p>
                  <p className={highlightValue("temp")}>
                    {reading.temp ?? "-"} C
                  </p>
                </div>
                <div className="rounded-lg border border-ink/10 bg-ink/5 px-2 py-1">
                  <p className="text-[11px] text-muted">SpO2</p>
                  <p className={highlightValue("spo2")}>
                    {reading.spo2 ?? "-"}%
                  </p>
                </div>
                <div className="rounded-lg border border-ink/10 bg-ink/5 px-2 py-1">
                  <p className="text-[11px] text-muted">RR</p>
                  <p className={highlightValue("rr")}>
                    {reading.rr ?? "-"}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted">
                Contexto: {formatContext(reading.context)}
              </div>
              <div className="text-xs text-muted">
                Origen: {SOURCE_LABELS[reading.source] || "-"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
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

              return (
                <tr key={reading.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 text-ink">
                    {formatDateTime(reading.timestampISO)}
                  </td>
                  <td className={`px-4 py-3 ${highlightCell("hr")}`}>
                    {reading.hr ?? "-"} bpm
                  </td>
                  <td className={`px-4 py-3 ${highlightCell("temp")}`}>
                    {reading.temp ?? "-"} C
                  </td>
                  <td className={`px-4 py-3 ${highlightCell("spo2")}`}>
                    {reading.spo2 ?? "-"}%
                  </td>
                  <td className={`px-4 py-3 ${highlightCell("rr")}`}>
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
      </div>
    </Card>
  );
}
