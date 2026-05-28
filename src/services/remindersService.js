import { getJSON, setJSON } from "../utils/storage";

const REMINDERS_KEY = "reminders";

function reminderKey(userId) {
  return `${REMINDERS_KEY}:${userId}`;
}

function toMillis(hours) {
  return Number(hours) * 60 * 60 * 1000;
}

export const DEFAULT_REMINDER = {
  enabled: false,
  everyHours: 6,
  note: "Recuerda registrar una lectura cuando te venga bien.",
  lastDismissedISO: null,
  nextDueISO: null,
  updatedAt: null,
};

export function normalizeReminder(reminder = {}) {
  return {
    enabled: Boolean(reminder.enabled),
    everyHours: Number.isFinite(Number(reminder.everyHours))
      ? Number(reminder.everyHours)
      : DEFAULT_REMINDER.everyHours,
    note: reminder.note || DEFAULT_REMINDER.note,
    lastDismissedISO: reminder.lastDismissedISO || null,
    nextDueISO: reminder.nextDueISO || null,
    updatedAt: reminder.updatedAt || new Date().toISOString(),
  };
}

export function getReminderConfig(userId) {
  const stored = getJSON(reminderKey(userId), null);
  if (!stored) {
    const created = { ...DEFAULT_REMINDER, updatedAt: new Date().toISOString() };
    setJSON(reminderKey(userId), created);
    return created;
  }
  const normalized = normalizeReminder(stored);
  if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
    setJSON(reminderKey(userId), normalized);
  }
  return normalized;
}

export function setReminderConfig(userId, values) {
  const current = getReminderConfig(userId);
  const next = normalizeReminder({
    ...current,
    ...values,
    enabled: values.enabled ?? current.enabled,
    everyHours: values.everyHours ?? current.everyHours,
    note: values.note ?? current.note,
    updatedAt: new Date().toISOString(),
  });

  if (next.enabled) {
    next.nextDueISO = new Date(Date.now() + toMillis(next.everyHours)).toISOString();
  } else {
    next.nextDueISO = null;
  }

  setJSON(reminderKey(userId), next);
  return next;
}

export function acknowledgeReminder(userId) {
  const current = getReminderConfig(userId);
  const next = normalizeReminder({
    ...current,
    lastDismissedISO: new Date().toISOString(),
    nextDueISO: current.enabled
      ? new Date(Date.now() + toMillis(current.everyHours)).toISOString()
      : null,
    updatedAt: new Date().toISOString(),
  });
  setJSON(reminderKey(userId), next);
  return next;
}

export function getReminderStatus(userId, latestReadingISO) {
  const config = getReminderConfig(userId);
  if (!config.enabled) {
    return {
      ...config,
      due: false,
      message: config.note,
    };
  }

  const anchorISO = latestReadingISO || config.lastDismissedISO || config.updatedAt;
  const anchorTime = anchorISO ? new Date(anchorISO).getTime() : Date.now();
  const nextDueTime = anchorTime + toMillis(config.everyHours);
  const due = Date.now() >= nextDueTime;

  return {
    ...config,
    due,
    nextDueISO: new Date(nextDueTime).toISOString(),
    message: config.note,
  };
}
