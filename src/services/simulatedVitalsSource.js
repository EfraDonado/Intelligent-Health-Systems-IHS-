import { generateRandomReading } from "../utils/random";

function pickActivity() {
  const roll = Math.random();
  if (roll < 0.7) return "reposo";
  if (roll < 0.9) return "caminando";
  return "ejercicio";
}

function pickStress(activity) {
  if (activity === "ejercicio") return Math.random() > 0.4 ? "medio" : "alto";
  if (activity === "caminando") return Math.random() > 0.6 ? "medio" : "bajo";
  const roll = Math.random();
  if (roll < 0.7) return "bajo";
  if (roll < 0.9) return "medio";
  return "alto";
}

function pickFlags() {
  return {
    cafe: Math.random() < 0.18,
    malaNoche: Math.random() < 0.12,
    medicacion: Math.random() < 0.1,
  };
}

function randomInterval() {
  return 2000 + Math.floor(Math.random() * 3000);
}

export class SimulatedVitalsSource {
  constructor(controller) {
    this.controller = controller;
    this.timerId = null;
  }

  start() {
    if (this.timerId || !this.controller.isConnected()) return;

    const tick = () => {
      if (!this.controller.isConnected()) {
        this.stop();
        return;
      }

      const activity = pickActivity();
      const context = {
        activity,
        stress: pickStress(activity),
        flags: pickFlags(),
      };
      const scenario = Math.random() < 0.18 ? "alert" : "normal";
      this.controller.generateAndStoreReading({
        scenario,
        context,
        source: "simulated",
      });
      this.timerId = window.setTimeout(tick, randomInterval());
    };

    this.timerId = window.setTimeout(tick, 1200);
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
}
