import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "./Card";
import { formatTime } from "../utils/formatters";

const METRIC_LABELS = {
  hr: "HR",
  temp: "Temp",
  spo2: "SpO2",
  rr: "RR",
};

const METRIC_COLORS = {
  hr: "#2563EB",
  temp: "#22C55E",
  spo2: "#0EA5E9",
  rr: "#7C3AED",
};

export default function ReadingsChart({ readings, metric = "hr" }) {
  const data = [...readings]
    .slice(0, 12)
    .reverse()
    .map((reading) => ({
      time: formatTime(reading.timestampISO),
      value: reading[metric],
    }))
    .filter((item) => item.value !== null && item.value !== undefined);

  const label = METRIC_LABELS[metric] || METRIC_LABELS.hr;

  if (!data.length) {
    return (
      <Card className="flex min-h-[220px] items-center justify-center">
        <p className="text-sm text-muted">
          Aun no hay datos para {label}. Prueba con una lectura nueva.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-[220px] md:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" strokeDasharray="4" />
          <XAxis dataKey="time" stroke="#5B6B82" fontSize={12} />
          <YAxis stroke="#5B6B82" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              borderRadius: 8,
              color: "#0F172A",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={METRIC_COLORS[metric] || METRIC_COLORS.hr}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
