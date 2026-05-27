import { cx } from "../utils/classNames";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 disabled:cursor-not-allowed disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

const variants = {
  primary: "bg-accent text-white hover:bg-accent/90",
  outline:
    "border border-ink/15 text-ink hover:border-ink/30 hover:bg-ink/5",
  ghost: "text-ink/70 hover:text-ink hover:bg-ink/5",
  subtle: "bg-ink/5 text-ink/70 hover:bg-ink/10",
  danger: "bg-rose-100 text-rose-700 hover:bg-rose-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2",
  lg: "px-5 py-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={cx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
