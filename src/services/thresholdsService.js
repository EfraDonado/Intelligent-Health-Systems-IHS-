import { getJSON, setJSON } from "./storage";

const THRESHOLDS_KEY = "thresholds";

export const DEFAULT_THRESHOLDS = {
  hrMin: 60,
  hrMax: 100,
  tempMin: 36.0,
  tempMax: 37.5,
  spo2Min: 92,
};

export function normalizeThresholds(thresholds = {}) {
  return {
    userId: thresholds.userId,
    hrMin: Number.isFinite(Number(thresholds.hrMin)) ? Number(thresholds.hrMin) : DEFAULT_THRESHOLDS.hrMin,
    hrMax: Number.isFinite(Number(thresholds.hrMax)) ? Number(thresholds.hrMax) : DEFAULT_THRESHOLDS.hrMax,
    tempMin: Number.isFinite(Number(thresholds.tempMin)) ? Number(thresholds.tempMin) : DEFAULT_THRESHOLDS.tempMin,
    tempMax: Number.isFinite(Number(thresholds.tempMax)) ? Number(thresholds.tempMax) : DEFAULT_THRESHOLDS.tempMax,
    spo2Min: Number.isFinite(Number(thresholds.spo2Min)) ? Number(thresholds.spo2Min) : DEFAULT_THRESHOLDS.spo2Min,
    updatedAt: thresholds.updatedAt || new Date().toISOString(),
  };
}

export function getThresholds(userId) {
  const all = getJSON(THRESHOLDS_KEY, []);
  const existing = all.find((item) => item.userId === userId);
  if (existing) {
    const normalized = normalizeThresholds(existing);
    if (JSON.stringify(normalized) !== JSON.stringify(existing)) {
      const updated = [
        normalized,
        ...all.filter((item) => item.userId !== userId),
      ];
      setJSON(THRESHOLDS_KEY, updated);
    }
    return normalized;
  }

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
  const spo2Min = Number(values.spo2Min);

  if (Number.isNaN(hrMin)) errors.hrMin = "Ingresa un numero valido.";
  if (Number.isNaN(hrMax)) errors.hrMax = "Ingresa un numero valido.";
  if (Number.isNaN(tempMin)) errors.tempMin = "Ingresa un numero valido.";
  if (Number.isNaN(tempMax)) errors.tempMax = "Ingresa un numero valido.";
  if (Number.isNaN(spo2Min)) errors.spo2Min = "Ingresa un numero valido.";

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
  if (!Number.isNaN(spo2Min) && (spo2Min < 70 || spo2Min > 100)) {
    errors.spo2Min = "SpO2 minima fuera de rango (70-100).";
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
    spo2Min: Number(values.spo2Min),
    updatedAt: new Date().toISOString(),
  };

  const updated = [next, ...all.filter((item) => item.userId !== userId)];
  setJSON(THRESHOLDS_KEY, updated);
  return { ok: true, data: next };
}
