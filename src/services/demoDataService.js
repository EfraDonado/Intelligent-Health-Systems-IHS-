import { getJSON, setJSON } from "./storage";
import { createReading } from "./readingsService";
import { getThresholds } from "./thresholdsService";
import { generateRandomReading } from "../utils/random";

const DEMO_SEED_KEY = "demoSeeded";

function buildContext(index) {
  const activities = ["reposo", "caminando", "ejercicio"];
  const stresses = ["bajo", "medio", "alto"];
  const activity = activities[index % activities.length];
  const stress = activity === "reposo" ? stresses[index % 2] : stresses[(index + 1) % stresses.length];

  return {
    activity,
    stress,
    flags: {
      cafe: index % 5 === 0,
      malaNoche: index % 7 === 0,
      medicacion: index % 9 === 0,
    },
  };
}

export function seedDemoData(userId) {
  const seeded = getJSON(DEMO_SEED_KEY, {});
  if (seeded[userId]) return;

  const thresholds = getThresholds(userId);
  const now = Date.now();

  Array.from({ length: 28 }).forEach((_, index) => {
    const offsetHours = index * 6;
    const timestampISO = new Date(now - offsetHours * 60 * 60 * 1000).toISOString();
    const context = buildContext(index);
    const scenario = index % 7 === 0 ? "alert" : "normal";
    const vitals = generateRandomReading(thresholds, scenario, context);
    createReading({
      userId,
      hr: vitals.hr,
      temp: vitals.temp,
      spo2: vitals.spo2,
      rr: vitals.rr,
      source: "demo",
      timestampISO,
      context,
      thresholds,
    });
  });

  setJSON(DEMO_SEED_KEY, { ...seeded, [userId]: true });
}
