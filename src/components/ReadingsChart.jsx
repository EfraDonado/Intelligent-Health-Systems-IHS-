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

export default function ReadingsChart({ readings, mode = "both" }) {
  const data = [...readings]
    .slice(0, 12)
    .reverse()
    .map((reading) => ({
      time: formatTime(reading.timestampISO),
      hr: reading.hr,
      temp: reading.temp,
    }));

  if (!data.length) {
    return (
      <Card className="flex min-h-[220px] items-center justify-center">
        <p className="text-sm text-muted">
          Aun no hay lecturas, genera una para empezar.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-[260px]">
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
          {(mode === "both" || mode === "hr") && (
            <Line
              type="monotone"
              dataKey="hr"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          )}
          {(mode === "both" || mode === "temp") && (
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
