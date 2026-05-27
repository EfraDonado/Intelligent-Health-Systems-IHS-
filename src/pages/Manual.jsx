import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";

export default function Manual() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      <SectionTitle
        title="Manual sencillo"
        subtitle="Guia clara para cualquier edad. Toma tu tiempo y sigue los pasos."
      />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">SaludIA</Badge>
          <p className="text-base text-muted">
            Esta pagina esta pensada para ser facil y tranquila.
          </p>
        </div>
        <p className="text-base text-ink/80 leading-relaxed">
          Si es tu primera vez, puedes entrar como demo para practicar. No necesitas
          datos reales para entender el flujo.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-ink">1. Primeros pasos</h3>
          <ul className="space-y-2 text-base text-ink/80">
            <li>Entra con tu correo o usa "Entrar como demo".</li>
            <li>En Dashboard veras tu resumen y el simulador.</li>
            <li>Presiona "Generar lectura" para ver datos nuevos.</li>
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-ink">2. Lecturas</h3>
          <ul className="space-y-2 text-base text-ink/80">
            <li>HR es ritmo cardiaco en bpm.</li>
            <li>Temp es temperatura en grados C.</li>
            <li>Si algo se ve en rojo, revisa Alertas.</li>
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-ink">3. Alertas</h3>
          <ul className="space-y-2 text-base text-ink/80">
            <li>Las alertas aparecen si un valor sale del rango.</li>
            <li>Puedes marcar una alerta como revisada.</li>
            <li>Esto es solo apoyo, no diagnostico medico.</li>
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-ink">4. Reportes</h3>
          <ul className="space-y-2 text-base text-ink/80">
            <li>Elige un periodo y revisa el resumen.</li>
            <li>Genera un PDF para guardar o presentar.</li>
            <li>El boton Compartir crea un link simulado.</li>
          </ul>
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-ink">Consejos de uso facil</h3>
        <ul className="space-y-2 text-base text-ink/80">
          <li>Usa el menu lateral para moverte entre secciones.</li>
          <li>Si estas en movil, el menu esta abajo de la pantalla.</li>
          <li>Lee cada tarjeta con calma; no necesitas hacerlo todo a la vez.</li>
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/dashboard")}>Ir al dashboard</Button>
        <Button variant="outline" onClick={() => navigate("/alerts")}
        >
          Ver alertas
        </Button>
        <Button variant="outline" onClick={() => navigate("/thresholds")}
        >
          Ajustar umbrales
        </Button>
      </div>
    </div>
  );
}
