import Card from "./Card";

export default function StatCard({ label, value, hint, badge }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        {badge}
      </div>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </Card>
  );
}
