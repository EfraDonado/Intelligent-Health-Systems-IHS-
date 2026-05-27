import { nanoid } from "nanoid";
import { getJSON, setJSON } from "./storage";

const ALERTS_KEY = "alerts";

export function create(reading, thresholds) {
  const alerts = getJSON(ALERTS_KEY, []);
  const created = [];

  if (reading.hr < thresholds.hrMin || reading.hr > thresholds.hrMax) {
    created.push({
      id: nanoid(),
      userId: reading.userId,
      timestampISO: reading.timestampISO,
      parameter: "hr",
      value: reading.hr,
      min: thresholds.hrMin,
      max: thresholds.hrMax,
      status: "new",
    });
  }

  if (reading.temp < thresholds.tempMin || reading.temp > thresholds.tempMax) {
    created.push({
      id: nanoid(),
      userId: reading.userId,
      timestampISO: reading.timestampISO,
      parameter: "temp",
      value: reading.temp,
      min: thresholds.tempMin,
      max: thresholds.tempMax,
      status: "new",
    });
  }

  if (created.length) {
    setJSON(ALERTS_KEY, [...created, ...alerts]);
  }

  return created;
}

export function listByUser(userId) {
  return getJSON(ALERTS_KEY, [])
    .filter((alert) => alert.userId === userId)
    .sort((a, b) => new Date(b.timestampISO) - new Date(a.timestampISO));
}

export function listByUserInRange(userId, start, end) {
  return listByUser(userId).filter((alert) => {
    const time = new Date(alert.timestampISO).getTime();
    if (start) {
      const startTime = new Date(start).setHours(0, 0, 0, 0);
      if (time < startTime) return false;
    }
    if (end) {
      const endTime = new Date(end).setHours(23, 59, 59, 999);
      if (time > endTime) return false;
    }
    return true;
  });
}

export function markReviewed(alertId) {
  const alerts = getJSON(ALERTS_KEY, []);
  const updated = alerts.map((alert) =>
    alert.id === alertId ? { ...alert, status: "reviewed" } : alert
  );
  setJSON(ALERTS_KEY, updated);
}

export function countNew(userId) {
  return listByUser(userId).filter((alert) => alert.status === "new").length;
}
