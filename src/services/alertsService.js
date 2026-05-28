import { nanoid } from "nanoid";
import { getJSON, setJSON } from "./storage";

const ALERTS_KEY = "alerts";

function normalizeAlert(alert = {}) {
  return {
    id: alert.id,
    userId: alert.userId,
    timestampISO: alert.timestampISO || new Date().toISOString(),
    parameter: alert.parameter || "hr",
    value: alert.value ?? null,
    min: alert.min ?? null,
    max: alert.max ?? null,
    status: alert.status || "new",
    kind: alert.kind || "threshold",
    severity: alert.severity || (alert.kind === "trend" ? "info" : "warning"),
    note: alert.note || "",
    signature: alert.signature || null,
  };
}

function saveAlerts(alerts) {
  setJSON(ALERTS_KEY, alerts.map(normalizeAlert));
}

function hasSignature(alerts, signature) {
  if (!signature) return false;
  return alerts.some((alert) => alert.signature === signature);
}

export function createThresholdAlerts(reading, thresholds) {
  const alerts = getJSON(ALERTS_KEY, []).map(normalizeAlert);
  const created = [];

  const thresholdChecks = [
    {
      parameter: "hr",
      value: reading.hr,
      min: thresholds.hrMin,
      max: thresholds.hrMax,
    },
    {
      parameter: "temp",
      value: reading.temp,
      min: thresholds.tempMin,
      max: thresholds.tempMax,
    },
    {
      parameter: "spo2",
      value: reading.spo2,
      min: thresholds.spo2Min,
      max: 100,
    },
  ];

  thresholdChecks.forEach((item) => {
    if (item.value === null || item.value === undefined) return;

    const outOfRange = item.parameter === "spo2"
      ? item.value < item.min
      : item.value < item.min || item.value > item.max;

    if (!outOfRange) return;

    const signature = `threshold:${reading.id}:${item.parameter}`;
    if (hasSignature(alerts, signature)) return;

    created.push(
      normalizeAlert({
        id: nanoid(),
        userId: reading.userId,
        timestampISO: reading.timestampISO,
        parameter: item.parameter,
        value: item.value,
        min: item.min,
        max: item.max,
        status: "new",
        kind: "threshold",
        severity: "warning",
        note: "Lectura fuera de rango.",
        signature,
      })
    );
  });

  if (created.length) {
    saveAlerts([...created, ...alerts]);
  }

  return created;
}

export function createTrendAlert({
  userId,
  timestampISO,
  parameter,
  value,
  note,
  signature,
}) {
  const alerts = getJSON(ALERTS_KEY, []).map(normalizeAlert);
  if (hasSignature(alerts, signature)) return [];

  const created = normalizeAlert({
    id: nanoid(),
    userId,
    timestampISO,
    parameter,
    value,
    status: "new",
    kind: "trend",
    severity: "info",
    note,
    signature,
  });

  saveAlerts([created, ...alerts]);
  return [created];
}

export function listByUser(userId) {
  return getJSON(ALERTS_KEY, [])
    .map(normalizeAlert)
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
  const updated = alerts.map((alert) => {
    const normalized = normalizeAlert(alert);
    return normalized.id === alertId
      ? { ...normalized, status: "reviewed" }
      : normalized;
  });
  saveAlerts(updated);
}

export function countNew(userId) {
  return listByUser(userId).filter((alert) => alert.status === "new").length;
}

export function getTrendCandidates(readings, thresholds) {
  const recent = [...readings].slice(0, 6).reverse();
  const items = [];

  if (recent.length >= 3) {
    const tempSeries = recent.filter((item) => item.temp !== null);
    const spo2Series = recent.filter((item) => item.spo2 !== null);

    const tempDelta = tempSeries.length >= 3
      ? tempSeries[tempSeries.length - 1].temp - tempSeries[0].temp
      : 0;
    const spo2Delta = spo2Series.length >= 2
      ? spo2Series[spo2Series.length - 1].spo2 - spo2Series[0].spo2
      : 0;

    if (tempSeries.length >= 3 && tempDelta >= 0.3) {
      items.push({
        parameter: "temp",
        value: tempSeries[tempSeries.length - 1].temp,
        note: "La temperatura viene subiendo suavemente en las ultimas horas.",
        signature: `trend:temp:${recent[recent.length - 1].timestampISO}`,
      });
    }

    const repeatedHrHigh = recent.filter((item) => {
      const inRest = item.context?.activity === "reposo";
      return inRest && item.hr !== null && item.hr > thresholds.hrMax;
    });

    if (repeatedHrHigh.length >= 3) {
      items.push({
        parameter: "hr",
        value: repeatedHrHigh[repeatedHrHigh.length - 1].hr,
        note: "El pulso se ha mantenido alto en reposo varias veces.",
        signature: `trend:hr:${recent[recent.length - 1].timestampISO}`,
      });
    }

    if (spo2Series.length >= 2 && spo2Delta < 0) {
      items.push({
        parameter: "spo2",
        value: spo2Series[spo2Series.length - 1].spo2,
        note: "La oxigenacion va bajando poco a poco.",
        signature: `trend:spo2:${recent[recent.length - 1].timestampISO}`,
      });
    }
  }

  return items;
}
