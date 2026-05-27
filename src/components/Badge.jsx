import { cx } from "../utils/classNames";

const styles = {
  normal: "border-accent2/40 bg-accent2/15 text-accent2",
  alert: "border-rose-200 bg-rose-100 text-rose-700",
  reviewed: "border-slate-200 bg-slate-100 text-slate-600",
  new: "border-amber-200 bg-amber-100 text-amber-700",
  info: "border-accent/40 bg-accent/15 text-accent",
  neutral: "border-ink/10 bg-ink/5 text-ink/70",
};

export default function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[variant] || styles.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
