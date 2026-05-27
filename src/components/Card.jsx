import { cx } from "../utils/classNames";

export default function Card({ className, ...props }) {
  return (
    <div className={cx("card-surface p-4 hover-lift fade-in", className)} {...props} />
  );
}
