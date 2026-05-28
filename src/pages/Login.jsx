import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Badge from "../components/Badge";
import { ensureDemoUser, login, setCurrentUser } from "../services/authService";
import { seedDemoData } from "../services/demoDataService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/dashboard");
  };

  const handleDemo = () => {
    const demoUser = ensureDemoUser();
    setCurrentUser(demoUser);
    seedDemoData(demoUser.id);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-midnight bg-mesh px-4 py-10">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6">
        <div>
          <Badge variant="info">IHS</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-ink">
            Intelligent Health Systems
          </h1>
          <p className="mt-2 text-sm text-muted">
            Accede a tu panel de salud y continua con tu seguimiento diario.
          </p>
        </div>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Iniciar sesion</h2>
            <p className="text-sm text-muted">
              Conecta tu dispositivo o usa el simulador.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
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
            {error && <p className="text-sm text-rose-200">{error}</p>}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleDemo}>
              Entrar como demo
            </Button>
            <p className="text-xs text-muted">
              Aun no tienes cuenta?{" "}
              <Link className="text-accent" to="/register">
                Crear acceso
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-xs text-muted">
          Apoyo informativo, no diagnostico medico.
        </p>
      </div>
    </div>
  );
}
