import { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import SectionTitle from "../components/SectionTitle";
import { getCurrentUser } from "../services/authService";
import {
  getThresholds,
  setThresholds,
  validateThresholds,
} from "../services/thresholdsService";
import { formatDateTime } from "../utils/formatters";

export default function Thresholds() {
  const user = getCurrentUser();
  const [values, setValues] = useState(() => getThresholds(user.id));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setValues(getThresholds(user.id));
  }, []);

  const handleChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = setThresholds(user.id, values);
    if (!result.ok) {
      setErrors(result.errors);
      setMessage("");
      return;
    }
    setErrors({});
    setMessage("Umbrales actualizados.");
    setValues(result.data);
  };

  const validation = validateThresholds(values);

  return (
    <div className="space-y-6 pb-20">
      <SectionTitle
        title="Umbrales personalizados"
        subtitle="Valores fuera de rango pueden generar alertas innecesarias."
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

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!validation.ok}>
            Guardar cambios
          </Button>
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
