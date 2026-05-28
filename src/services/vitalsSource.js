import { useEffect, useMemo, useState } from "react";
import { createReading, getLatestByUser, listByUser } from "./readingsService";
import { getThresholds, setThresholds } from "./thresholdsService";
import {
  countNew,
  createTrendAlert,
  getTrendCandidates,
  listByUser as listAlerts,
  markReviewed,
} from "./alertsService";
import {
  acknowledgeReminder,
  getReminderConfig,
  getReminderStatus,
  setReminderConfig,
} from "./remindersService";
import { calcBaseline, compareWithBaseline } from "../utils/stats";
import { getJSON, setJSON } from "../utils/storage";
import { generateRandomReading } from "../utils/random";
import { generateRecommendations } from "./aiService";
import { SimulatedVitalsSource } from "./simulatedVitalsSource";
import { ApiVitalsSource } from "./apiVitalsSource";

const SOURCE_MODE_KEY = "vitalsMode";
const CONNECTED_KEY = "vitalsConnected";

const sources = new Map();

function modeKey(userId) {
  return `${SOURCE_MODE_KEY}:${userId}`;
}

function connectedKey(userId) {
  return `${CONNECTED_KEY}:${userId}`;
}

function sourceLabel(mode) {
  return mode === "api" ? "API / conector" : "Simulada";
}

export class VitalsController {
  constructor(userId) {
    this.userId = userId;
    this.listeners = new Set();
    this.mode = getJSON(modeKey(userId), "simulated");
    this.connected = getJSON(connectedKey(userId), true);
    this.running = false;
    this.activeSource = this.mode === "api"
      ? new ApiVitalsSource(this)
      : new SimulatedVitalsSource(this);
    this.snapshot = this.buildSnapshot();
  }

  isConnected() {
    return this.connected;
  }

  getMode() {
    return this.mode;
  }

  getThresholds() {
    return getThresholds(this.userId);
  }

  getReminder() {
    return getReminderConfig(this.userId);
  }

  getReadings() {
    return listByUser(this.userId);
  }

  getAlerts() {
    return listAlerts(this.userId);
  }

  getLatest() {
    return getLatestByUser(this.userId);
  }

  getSnapshot() {
    return this.snapshot;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getSnapshot());
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit() {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((callback) => callback(this.snapshot));
  }

  refresh() {
    this.emit();
  }

  start() {
    this.running = true;
    if (this.connected) {
      this.activeSource.start();
    }
    this.emit();
  }

  stop() {
    this.running = false;
    this.activeSource.stop();
    this.emit();
  }

  setConnected(value) {
    this.connected = Boolean(value);
    setJSON(connectedKey(this.userId), this.connected);

    if (!this.connected) {
      this.activeSource.stop();
    } else if (this.running) {
      this.activeSource.start();
    }

    this.emit();
  }

  toggleConnected() {
    this.setConnected(!this.connected);
  }

  setMode(mode) {
    if (mode !== "simulated" && mode !== "api") return;
    if (this.mode === mode) return;

    this.mode = mode;
    setJSON(modeKey(this.userId), mode);
    this.activeSource.stop();
    this.activeSource =
      mode === "api"
        ? new ApiVitalsSource(this)
        : new SimulatedVitalsSource(this);

    if (this.running && this.connected) {
      this.activeSource.start();
    }

    this.emit();
  }

  setThresholds(values) {
    const result = setThresholds(this.userId, values);
    if (result.ok) this.emit();
    return result;
  }

  setReminder(values) {
    const next = setReminderConfig(this.userId, values);
    this.emit();
    return next;
  }

  acknowledgeReminder() {
    const next = acknowledgeReminder(this.userId);
    this.emit();
    return next;
  }

  markAlertReviewed(alertId) {
    markReviewed(alertId);
    this.emit();
  }

  generateAndStoreReading({ scenario = "normal", context = {}, source = "simulated" }) {
    const thresholds = this.getThresholds();
    const generated = generateRandomReading(thresholds, scenario, context);
    return this.storeReading({
      ...generated,
      context: generated.context || context,
      source,
      autoAlerts: true,
    });
  }

  ingestExternalReading(payload) {
    const latest = this.getLatest();
    if (
      latest &&
      payload.timestampISO &&
      latest.timestampISO === payload.timestampISO &&
      latest.source === (payload.source || "api")
    ) {
      return latest;
    }

    return this.storeReading({
      ...payload,
      source: payload.source || "api",
      autoAlerts: true,
    });
  }

  addManualReading(payload) {
    return this.storeReading({
      ...payload,
      source: "manual",
      autoAlerts: true,
    });
  }

  storeReading(payload) {
    const result = createReading({
      userId: this.userId,
      hr: payload.hr,
      temp: payload.temp,
      spo2: payload.spo2,
      rr: payload.rr,
      source: payload.source,
      timestampISO: payload.timestampISO,
      context: payload.context,
      thresholds: this.getThresholds(),
      autoAlerts: payload.autoAlerts !== false,
    });

    const readings = listByUser(this.userId);
    const thresholds = this.getThresholds();
    const trendCandidates = getTrendCandidates(readings, thresholds);
    trendCandidates.forEach((candidate) => {
      createTrendAlert({
        userId: this.userId,
        timestampISO: result.reading.timestampISO,
        parameter: candidate.parameter,
        value: candidate.value,
        note: candidate.note,
        signature: candidate.signature,
      });
    });

    this.emit();
    return result.reading;
  }

  buildSnapshot() {
    const readings = listByUser(this.userId);
    const alerts = listAlerts(this.userId);
    const thresholds = getThresholds(this.userId);
    const latestReading = readings[0] || null;
    const baseline = calcBaseline(readings, 7);
    const baselineDelta = compareWithBaseline(latestReading, baseline);
    const reminder = getReminderStatus(this.userId, latestReading?.timestampISO);
    const recommendations = generateRecommendations(
      readings,
      alerts,
      thresholds,
      baseline,
      baselineDelta
    );

    return {
      userId: this.userId,
      mode: this.mode,
      connected: this.connected,
      sourceLabel: sourceLabel(this.mode),
      readings,
      recentReadings: readings.slice(0, 5),
      alerts,
      latestReading,
      thresholds,
      baseline,
      baselineDelta,
      reminder,
      recommendations: recommendations.items,
      recommendationDisclaimer: recommendations.disclaimer,
      newAlertsCount: countNew(this.userId),
      trendAlerts: alerts.filter((alert) => alert.kind === "trend"),
    };
  }
}

export function getVitalsSource(userId) {
  if (!sources.has(userId)) {
    sources.set(userId, new VitalsController(userId));
  }
  return sources.get(userId);
}

export function useVitalsSource(userId, options = {}) {
  const source = useMemo(() => getVitalsSource(userId), [userId]);
  const [snapshot, setSnapshot] = useState(() => source.getSnapshot());

  useEffect(() => {
    const unsubscribe = source.subscribe(setSnapshot);
    if (options.autoStart) source.start();
    return () => {
      unsubscribe();
      if (options.autoStart) source.stop();
    };
  }, [source, options.autoStart]);

  return {
    source,
    ...snapshot,
  };
}
