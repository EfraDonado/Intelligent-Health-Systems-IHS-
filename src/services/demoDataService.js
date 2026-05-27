import { getJSON, setJSON } from "./storage";
import { createReading } from "./readingsService";
import { getThresholds } from "./thresholdsService";

const DEMO_SEED_KEY = "demoSeeded";

export function seedDemoData(userId) {
  const seeded = getJSON(DEMO_SEED_KEY, {});
  if (seeded[userId]) return;

  const thresholds = getThresholds(userId);
  const now = Date.now();

  const samples = [
    { hr: 72, temp: 36.6 },
    { hr: 88, temp: 36.9 },
    { hr: 96, temp: 37.2 },
    { hr: 102, temp: 37.8 },
    { hr: 110, temp: 38.2 },
    { hr: 76, temp: 36.7 },
    { hr: 98, temp: 37.4 },
    { hr: 68, temp: 36.3 },
  ];

  samples.forEach((sample, index) => {
    const timestampISO = new Date(now - index * 6 * 60 * 60 * 1000).toISOString();
    createReading({
      userId,
      hr: sample.hr,
      temp: sample.temp,
      source: "demo",
      timestampISO,
      thresholds,
    });
  });

  setJSON(DEMO_SEED_KEY, { ...seeded, [userId]: true });
}
