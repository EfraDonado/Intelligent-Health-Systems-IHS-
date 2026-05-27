import { cx } from "../utils/classNames";

export default function SectionTitle({ title, subtitle, action, className }) {
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
