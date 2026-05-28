import { useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";

const FLAG_OPTIONS = [
  { key: "cafe", label: "Cafe" },
  { key: "malaNoche", label: "Mala noche" },
  { key: "medicacion", label: "Medicacion" },
];

export default function DeviceSimulator({
  connected,
  onToggle,
  onGenerate,
  onManualAdd,
  thresholds,
  sourceMode,
  onModeChange,
}) {
  const [scenario, setScenario] = useState("normal");
  const [manual, setManual] = useState({
    hr: "",
    temp: "",
    spo2: "",
    rr: "",
    activity: "reposo",
    stress: "medio",
    flags: {
      cafe: false,
      malaNoche: false,
      medicacion: false,
    },
  });

  const updateManual = (field, value) => {
    setManual((prev) => ({ ...prev, [field]: value }));
  };

  const updateFlag = (flag) => {
    setManual((prev) => ({
      ...prev,
      flags: { ...prev.flags, [flag]: !prev.flags[flag] },
    }));
  };

  const handleGenerate = () => {
    onGenerate({ scenario, context: manual });
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    if (!manual.hr || !manual.temp || !manual.spo2) return;
    onManualAdd({
      hr: manual.hr,
      temp: manual.temp,
      spo2: manual.spo2,
      rr: manual.rr || null,
      context: manual,
    });
    setManual((prev) => ({
      ...prev,
      hr: "",
      temp: "",
      spo2: "",
      rr: "",
    }));
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink">
            Simulador de lectura
          </h3>
          <p className="text-sm text-muted">
            Conecta la fuente o usa el simulador. Todo queda guardado localmente.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-3 rounded-full border border-ink/10 bg-ink/5 px-3 py-2 text-sm text-ink/70 transition hover:bg-ink/10"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? "bg-accent2" : "bg-rose-400"
            }`}
          />
          {connected ? "Fuente activa" : "Fuente detenida"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-muted">Fuente de lecturas</label>
          <select
            value={sourceMode}
            onChange={(event) => onModeChange(event.target.value)}
            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-accent/60 focus:outline-none"
          >
            <option value="simulated">Simulada</option>
            <option value="api">API / conector</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-muted">Escenario</label>
          <select
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-accent/60 focus:outline-none"
          >
            <option value="normal">Normal</option>
            <option value="alert">Forzar alerta</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-3 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label="HR (bpm)"
            type="number"
            min="30"
            max="220"
            step="1"
            value={manual.hr}
            onChange={(event) => updateManual("hr", event.target.value)}
          />
          <Input
            label="Temp (C)"
            type="number"
            min="34"
            max="41"
            step="0.1"
            value={manual.temp}
            onChange={(event) => updateManual("temp", event.target.value)}
          />
          <Input
            label="SpO2 (%)"
            type="number"
            min="85"
            max="100"
            step="1"
            value={manual.spo2}
            onChange={(event) => updateManual("spo2", event.target.value)}
          />
          <Input
            label="RR (opcional)"
            type="number"
            min="10"
            max="30"
            step="1"
            value={manual.rr}
            onChange={(event) => updateManual("rr", event.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-muted">Actividad</label>
            <select
              value={manual.activity}
              onChange={(event) => updateManual("activity", event.target.value)}
              className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-accent/60 focus:outline-none"
            >
              <option value="reposo">Reposo</option>
              <option value="caminando">Caminando</option>
              <option value="ejercicio">Ejercicio</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted">Estrés</label>
            <select
              value={manual.stress}
              onChange={(event) => updateManual("stress", event.target.value)}
              className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-accent/60 focus:outline-none"
            >
              <option value="bajo">Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FLAG_OPTIONS.map((flag) => (
            <label
              key={flag.key}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ink/5 px-3 py-1.5 text-xs text-ink/70"
            >
              <input
                type="checkbox"
                checked={manual.flags[flag.key]}
                onChange={() => updateFlag(flag.key)}
              />
              {flag.label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleGenerate} disabled={!connected}>
            Generar lectura
          </Button>
          <Button type="button" variant="outline" onClick={handleManualSubmit}>
            Guardar manual
          </Button>
          <p className="text-xs text-muted">
            Valores fuera de rango pueden generar alertas innecesarias.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="info">HR {thresholds.hrMin}-{thresholds.hrMax} bpm</Badge>
        <Badge variant="info">Temp {thresholds.tempMin}-{thresholds.tempMax} C</Badge>
        <Badge variant="info">SpO2 minimo {thresholds.spo2Min}%</Badge>
      </div>
    </Card>
  );
}
