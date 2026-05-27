import { getJSON, setJSON } from "./storage";

const THRESHOLDS_KEY = "thresholds";

export const DEFAULT_THRESHOLDS = {
  hrMin: 60,
  hrMax: 100,
  tempMin: 36.0,
  tempMax: 37.5,
};

export function getThresholds(userId) {
  const all = getJSON(THRESHOLDS_KEY, []);
  const existing = all.find((item) => item.userId === userId);
  if (existing) return existing;

  const created = {
    userId,
    ...DEFAULT_THRESHOLDS,
    updatedAt: new Date().toISOString(),
  };
  setJSON(THRESHOLDS_KEY, [created, ...all]);
  return created;
}

export function validateThresholds(values) {
  const errors = {};
  const hrMin = Number(values.hrMin);
  const hrMax = Number(values.hrMax);
  const tempMin = Number(values.tempMin);
  const tempMax = Number(values.tempMax);

  if (Number.isNaN(hrMin)) errors.hrMin = "Ingresa un numero valido.";
  if (Number.isNaN(hrMax)) errors.hrMax = "Ingresa un numero valido.";
  if (Number.isNaN(tempMin)) errors.tempMin = "Ingresa un numero valido.";
  if (Number.isNaN(tempMax)) errors.tempMax = "Ingresa un numero valido.";

  if (!Number.isNaN(hrMin) && (hrMin < 30 || hrMin > 220)) {
    errors.hrMin = "HR minimo fuera de rango (30-220).";
  }
  if (!Number.isNaN(hrMax) && (hrMax < 30 || hrMax > 220)) {
    errors.hrMax = "HR maximo fuera de rango (30-220).";
  }
  if (!Number.isNaN(tempMin) && (tempMin < 34 || tempMin > 41)) {
    errors.tempMin = "Temp minima fuera de rango (34-41).";
  }
  if (!Number.isNaN(tempMax) && (tempMax < 34 || tempMax > 41)) {
    errors.tempMax = "Temp maxima fuera de rango (34-41).";
  }

  if (!Number.isNaN(hrMin) && !Number.isNaN(hrMax) && hrMin >= hrMax) {
    errors.hrMax = "HR maximo debe ser mayor que HR minimo.";
  }
  if (
    !Number.isNaN(tempMin) &&
    !Number.isNaN(tempMax) &&
    tempMin >= tempMax
  ) {
    errors.tempMax = "Temp maxima debe ser mayor que Temp minima.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function setThresholds(userId, values) {
  const validation = validateThresholds(values);
  if (!validation.ok) return validation;

  const all = getJSON(THRESHOLDS_KEY, []);
  const next = {
    userId,
    hrMin: Number(values.hrMin),
    hrMax: Number(values.hrMax),
    tempMin: Number(values.tempMin),
    tempMax: Number(values.tempMax),
    updatedAt: new Date().toISOString(),
  };

  const updated = [next, ...all.filter((item) => item.userId !== userId)];
  setJSON(THRESHOLDS_KEY, updated);
  return { ok: true, data: next };
}
