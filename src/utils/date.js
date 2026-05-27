function pad(value) {
  return String(value).padStart(2, "0");
}

export function toDateInputValue(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate()
  )}`;
}

export function isInRange(iso, start, end) {
  if (!iso) return false;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  if (start) {
    const startTime = new Date(start).setHours(0, 0, 0, 0);
    if (time < startTime) return false;
  }
  if (end) {
    const endTime = new Date(end).setHours(23, 59, 59, 999);
    if (time > endTime) return false;
  }
  return true;
}
