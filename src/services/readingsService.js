import { nanoid } from "nanoid";
import { getJSON, setJSON } from "./storage";
import { createThresholdAlerts } from "./alertsService";
import { getThresholds } from "./thresholdsService";

const READINGS_KEY = "readings";

export const DEFAULT_READING_CONTEXT = {
  activity: "reposo",
  stress: "medio",
  flags: {
    cafe: false,
    malaNoche: false,
    medicacion: false,
  },
};

function normalizeFlags(flags = {}) {
  return {
    cafe: Boolean(flags.cafe),
    malaNoche: Boolean(flags.malaNoche),
    medicacion: Boolean(flags.medicacion),
  };
}

export function normalizeContext(context = {}) {
  return {
    activity: context.activity || DEFAULT_READING_CONTEXT.activity,
    stress: context.stress || DEFAULT_READING_CONTEXT.stress,
    flags: normalizeFlags(context.flags),
  };
}

export function normalizeReading(reading = {}) {
  return {
    id: reading.id,
    userId: reading.userId,
    timestampISO: reading.timestampISO || new Date().toISOString(),
    hr: reading.hr === null || reading.hr === undefined ? null : Number(reading.hr),
    temp:
      reading.temp === null || reading.temp === undefined
        ? null
        : Number(reading.temp),
    spo2:
      reading.spo2 === null || reading.spo2 === undefined
        ? null
        : Number(reading.spo2),
    rr:
      reading.rr === null || reading.rr === undefined
        ? null
        : Number(reading.rr),
    source: reading.source || "device",
    context: normalizeContext(reading.context),
  };
}

export function listByUser(userId) {
  return getJSON(READINGS_KEY, [])
    .map(normalizeReading)
    .filter((reading) => reading.userId === userId)
    .sort((a, b) => new Date(b.timestampISO) - new Date(a.timestampISO));
}

export function listByUserInRange(userId, start, end) {
  return listByUser(userId).filter((reading) => {
    const time = new Date(reading.timestampISO).getTime();
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

export function createReading({
  userId,
  hr,
  temp,
  spo2 = null,
  rr = null,
  source,
  timestampISO,
  thresholds,
  context,
  autoAlerts = true,
}) {
  const reading = normalizeReading({
    id: nanoid(),
    userId,
    timestampISO: timestampISO || new Date().toISOString(),
    hr,
    temp,
    spo2,
    rr,
    source: source || "device",
    context,
  });

  const readings = getJSON(READINGS_KEY, []);
  setJSON(READINGS_KEY, [reading, ...readings]);

  const activeThresholds = thresholds || getThresholds(userId);
  const alerts = autoAlerts ? createThresholdAlerts(reading, activeThresholds) : [];

  return { reading, alerts };
}

export function getLatestByUser(userId) {
  return listByUser(userId)[0] || null;
}
