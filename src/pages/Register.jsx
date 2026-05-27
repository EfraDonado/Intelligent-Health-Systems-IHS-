import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { register } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    consent: false,
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = register(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-midnight bg-mesh px-4 py-10">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6">
        <div>
          <Badge variant="info">SaludIA</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ink">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-muted">
            Configura tu perfil y empieza a registrar lecturas.
          </p>
        </div>

        <Card className="space-y-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
            <Input
              label="Correo"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tucorreo@ejemplo.com"
              required
            />
            <Input
              label="Contrasena"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              required
            />

            <label className="flex items-start gap-3 text-xs text-muted">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                className="mt-0.5"
              />
              Acepto el uso de mis datos para fines demostrativos.
            </label>

            {error && <p className="text-sm text-rose-200">{error}</p>}
            <Button type="submit" className="w-full">
              Crear acceso
            </Button>
          </form>

          <p className="text-xs text-muted">
            Ya tienes cuenta?{" "}
            <Link className="text-accent" to="/login">
              Inicia sesion
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
