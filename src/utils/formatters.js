const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso) {
  if (!iso) return "-";
  return dateFormatter.format(new Date(iso));
}

export function formatTime(iso) {
  if (!iso) return "-";
  return timeFormatter.format(new Date(iso));
}

export function formatDateTime(iso) {
  if (!iso) return "-";
  return dateTimeFormatter.format(new Date(iso));
}
