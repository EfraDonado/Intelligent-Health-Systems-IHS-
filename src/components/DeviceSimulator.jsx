import { useState } from "react";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import Badge from "./Badge";

export default function DeviceSimulator({
  connected,
  onToggle,
  onGenerate,
  onManualAdd,
  thresholds,
}) {
  const [mode, setMode] = useState("normal");
  const [manual, setManual] = useState({ hr: "", temp: "" });

  const handleGenerate = () => {
    onGenerate(mode);
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    if (!manual.hr || !manual.temp) return;
    onManualAdd({ hr: manual.hr, temp: manual.temp });
    setManual({ hr: "", temp: "" });
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink">
            Simulador de dispositivo
          </h3>
          <p className="text-sm text-muted">
            Conecta tu dispositivo o usa el simulador para generar lecturas.
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
          {connected ? "Dispositivo conectado" : "Dispositivo desconectado"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-2">
          <label className="text-sm text-muted">Modo de lectura</label>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-accent/60 focus:outline-none"
          >
            <option value="normal">Normal</option>
            <option value="alert">Forzar alerta</option>
          </select>
        </div>
        <Button onClick={handleGenerate} disabled={!connected}>
          Generar lectura
        </Button>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-3">
        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleManualSubmit}>
          <Input
            label="HR (bpm)"
            type="number"
            min="30"
            max="220"
            step="1"
            value={manual.hr}
            onChange={(event) =>
              setManual((prev) => ({ ...prev, hr: event.target.value }))
            }
          />
          <Input
            label="Temp (C)"
            type="number"
            min="34"
            max="41"
            step="0.1"
            value={manual.temp}
            onChange={(event) =>
              setManual((prev) => ({ ...prev, temp: event.target.value }))
            }
          />
          <div className="flex items-end">
            <Button type="submit" variant="outline" className="w-full">
              Agregar manual
            </Button>
          </div>
        </form>
        <p className="mt-3 text-xs text-muted">
          Valores fuera de rango pueden generar alertas innecesarias.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="info">HR {thresholds.hrMin}-{thresholds.hrMax} bpm</Badge>
        <Badge variant="info">
          Temp {thresholds.tempMin}-{thresholds.tempMax} C
        </Badge>
      </div>
    </Card>
  );
}
