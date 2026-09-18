import { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import SectionTitle from "../components/SectionTitle";
import { getCurrentUser } from "../services/authService";
import { useVitalsSource } from "../services/vitalsSource";
import { formatDateTime } from "../utils/formatters";

export default function Thresholds() {
  const user = getCurrentUser();
  const { thresholds, source } = useVitalsSource(user?.id || "guest", {
    autoStart: false,
  });
  const [values, setValues] = useState(thresholds);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setValues(thresholds);
  }, [thresholds]);

  if (!user) return null;

  const handleChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = source.setThresholds(values);
    if (!result.ok) {
      setErrors(result.errors);
      setMessage("");
      return;
    }
    setErrors({});
    setMessage("Umbrales actualizados.");
    setValues(result.data);
  };

  return (
    <div className="space-y-6 pb-24">
      <SectionTitle
        title="Umbrales personalizados"
        subtitle="Si los haces muy bajos o muy altos, la app te puede avisar de mas."
      />

      <form className="card-surface grid gap-4 p-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="HR minimo"
            name="hrMin"
            type="number"
            min="30"
            max="220"
            value={values.hrMin}
            onChange={handleChange}
            error={errors.hrMin}
          />
          <Input
            label="HR maximo"
            name="hrMax"
            type="number"
            min="30"
            max="220"
            value={values.hrMax}
            onChange={handleChange}
            error={errors.hrMax}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Temp minima"
            name="tempMin"
            type="number"
            min="34"
            max="41"
            step="0.1"
            value={values.tempMin}
            onChange={handleChange}
            error={errors.tempMin}
          />
          <Input
            label="Temp maxima"
            name="tempMax"
            type="number"
            min="34"
            max="41"
            step="0.1"
            value={values.tempMax}
            onChange={handleChange}
            error={errors.tempMax}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="SpO2 minima"
            name="spo2Min"
            type="number"
            min="70"
            max="100"
            value={values.spo2Min}
            onChange={handleChange}
            error={errors.spo2Min}
            helper="Valores fuera de rango pueden generar alertas innecesarias."
          />
          <div className="rounded-xl border border-ink/10 bg-ink/5 p-4 text-sm text-muted">
            <p className="font-semibold text-ink">Consejo rapido</p>
            <p className="mt-2">
              Mantener estos valores dentro de un rango razonable ayuda a que las
              alertas sean mas utiles y menos ruidosas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" className="w-full sm:w-auto">Guardar cambios</Button>
          {message && <p className="text-xs text-accent">{message}</p>}
          {values.updatedAt && (
            <p className="text-xs text-muted">
              Ultima actualizacion: {formatDateTime(values.updatedAt)}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
