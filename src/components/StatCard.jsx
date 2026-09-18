import Card from "./Card";
import { cx } from "../utils/classNames";

export default function StatCard({ label, value, hint, badge, className }) {
  return (
    <Card className={cx("flex flex-col gap-2 sm:gap-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        {badge}
      </div>
      <p className="text-xl font-semibold text-ink sm:text-2xl">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </Card>
  );
}
