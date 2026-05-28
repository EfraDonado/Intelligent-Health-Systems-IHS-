import { generateRandomReading } from "../utils/random";

function randomInterval() {
  return 2200 + Math.floor(Math.random() * 2800);
}

function getBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
}

export class ApiVitalsSource {
  constructor(controller) {
    this.controller = controller;
    this.timerId = null;
  }

  async pollOnce() {
    const baseUrl = getBaseUrl();

    if (!baseUrl) {
      const thresholds = this.controller.getThresholds();
      const fallback = generateRandomReading(thresholds, "normal", {
        activity: "reposo",
        stress: "medio",
        flags: { cafe: false, malaNoche: false, medicacion: false },
      });

      this.controller.ingestExternalReading({
        ...fallback,
        rr: null,
        source: "api",
        context: null,
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/readings/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      if (!payload) return;
      this.controller.ingestExternalReading({
        ...payload,
        source: "api",
      });
    } catch (error) {
      // Silent fallback: the prototype must keep running without backend.
    }
  }

  start() {
    if (this.timerId || !this.controller.isConnected()) return;

    const loop = async () => {
      if (!this.controller.isConnected()) {
        this.stop();
        return;
      }
      await this.pollOnce();
      this.timerId = window.setTimeout(loop, randomInterval());
    };

    this.timerId = window.setTimeout(loop, 1200);
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  getLatest() {
    return this.controller.getLatest();
  }

  subscribe(callback) {
    return this.controller.subscribe(callback);
  }

  setMode(mode) {
    this.controller.setMode(mode);
  }

  async postReading(payload) {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return null;

    try {
      const response = await fetch(`${baseUrl}/api/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      return null;
    }
  }
}
