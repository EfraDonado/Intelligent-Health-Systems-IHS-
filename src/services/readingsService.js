import { nanoid } from "nanoid";
import { getJSON, setJSON } from "./storage";
import { create as createAlert } from "./alertsService";
import { getThresholds } from "./thresholdsService";

const READINGS_KEY = "readings";

export function listByUser(userId) {
  return getJSON(READINGS_KEY, [])
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
  source,
  timestampISO,
  thresholds,
}) {
  const reading = {
    id: nanoid(),
    userId,
    timestampISO: timestampISO || new Date().toISOString(),
    hr: Number(hr),
    temp: Number(temp),
    source: source || "device",
  };

  const readings = getJSON(READINGS_KEY, []);
  setJSON(READINGS_KEY, [reading, ...readings]);

  const activeThresholds = thresholds || getThresholds(userId);
  const alerts = createAlert(reading, activeThresholds);

  return { reading, alerts };
}
