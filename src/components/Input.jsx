import { useId } from "react";
import { cx } from "../utils/classNames";

export default function Input({
  label,
  helper,
  error,
  className,
  id,
  ...props
}) {
  const fallbackId = useId();
  const inputId = id || fallbackId;

  return (
    <div className={cx("grid gap-2", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cx(
          "min-h-[40px] w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none",
          error && "border-rose-400/70"
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {helper && !error && <p className="text-xs text-muted">{helper}</p>}
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </div>
  );
}
