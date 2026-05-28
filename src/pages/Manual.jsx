import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";

export default function Manual() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-24">
      <SectionTitle
        title="Manual guiado IHS"
        subtitle="Paso a paso, letra clara y sin prisa. Pensado para personas mayores."
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">IHS</Badge>
          <p className="text-lg text-muted">
            Este manual esta dividido en pasos cortos para leer con calma.
          </p>
        </div>
        <p className="text-lg text-ink/80 leading-relaxed">
          Si es tu primera vez, usa el modo demo para practicar. No necesitas
          datos reales para entender el flujo.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-base text-ink/80">
            <p className="font-semibold text-ink">Ayuda rapida</p>
            <ul className="mt-2 space-y-1">
              <li>Usa el menu lateral para moverte.</li>
              <li>En movil, el menu esta abajo.</li>
              <li>Si tienes dudas, abre IHSchat.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-base text-ink/80">
            <p className="font-semibold text-ink">Consejo de lectura</p>
            <ul className="mt-2 space-y-1">
              <li>Lee una tarjeta a la vez.</li>
              <li>No necesitas hacerlo todo hoy.</li>
              <li>Si te cansas, vuelve luego.</li>
            </ul>
          </div>
        </div>
      </Card>

      <SectionTitle
        title="Pasos principales"
        subtitle="Sigue este orden si es tu primera vez."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">1. Ingreso y modo demo</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>Entra con tu correo o usa "Entrar como demo".</li>
            <li>El demo es seguro y sirve para practicar.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">2. Dashboard (pantalla principal)</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>Aqui ves el resumen del dia.</li>
            <li>Veras la fuente activa y alertas nuevas.</li>
            <li>Usa "Cargar datos demo" si quieres ver ejemplos.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">3. Generar lecturas</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>En Simulador pulsa "Generar lectura".</li>
            <li>Si tienes valores reales, usa la lectura manual.</li>
            <li>Completa HR, Temp, SpO2 y RR si los tienes.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">4. Alertas</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>Las alertas aparecen si un valor sale del rango.</li>
            <li>Marca la alerta como revisada cuando la veas.</li>
            <li>Si te preocupa, consulta con un profesional.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">5. Historial y grafica</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>Filtra por fecha para ver tus lecturas.</li>
            <li>Elige la metrica que quieres revisar.</li>
            <li>Exporta CSV o JSON si lo necesitas.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">6. Umbrales y reportes</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>En Umbrales ajusta minimos y maximos con calma.</li>
            <li>En Reportes selecciona un periodo y genera PDF.</li>
            <li>Compartir crea un link simulado.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">7. Recordatorios y perfil</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>Activa recordatorios para no olvidar lecturas.</li>
            <li>En Perfil puedes exportar datos o borrar cuenta local.</li>
          </ol>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">8. IHSchat (ayuda rapida)</h3>
          <ol className="list-decimal space-y-2 pl-5 text-lg text-ink/80">
            <li>Abre el asistente con el boton inferior.</li>
            <li>Escribe tu duda o usa las opciones rapidas.</li>
            <li>Te guiara con pasos simples.</li>
          </ol>
        </Card>
      </div>

      <SectionTitle title="Terminos simples" subtitle="Palabras clave explicadas en corto." />
      <Card className="space-y-3">
        <ul className="space-y-2 text-lg text-ink/80">
          <li><span className="font-semibold text-ink">HR:</span> pulso o ritmo cardiaco (latidos por minuto).</li>
          <li><span className="font-semibold text-ink">Temp:</span> temperatura corporal en grados C.</li>
          <li><span className="font-semibold text-ink">SpO2:</span> oxigenacion de la sangre en porcentaje.</li>
          <li><span className="font-semibold text-ink">RR:</span> respiraciones por minuto.</li>
          <li><span className="font-semibold text-ink">Linea base:</span> promedio de lecturas en reposo.</li>
        </ul>
      </Card>

      <SectionTitle title="Seguridad y cuidado" subtitle="Recordatorios importantes." />
      <Card className="space-y-3">
        <ul className="space-y-2 text-lg text-ink/80">
          <li>Esto es apoyo informativo, no diagnostico medico.</li>
          <li>Si hay dolor fuerte, falta de aire o malestar intenso, busca ayuda.</li>
          <li>Los datos se guardan solo en este dispositivo.</li>
        </ul>
      </Card>

      <SectionTitle title="Atajos utiles" subtitle="Pequenos trucos para usar mas facil." />
      <Card className="space-y-3">
        <ul className="space-y-2 text-lg text-ink/80">
          <li>En computadora puedes usar zoom del navegador si necesitas letras mas grandes.</li>
          <li>Los botones principales siempre estan en el Dashboard.</li>
          <li>Si te pierdes, vuelve al Dashboard desde el menu.</li>
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/dashboard")}>Ir al dashboard</Button>
        <Button variant="outline" onClick={() => navigate("/alerts")}>
          Ver alertas
        </Button>
        <Button variant="outline" onClick={() => navigate("/thresholds")}>
          Ajustar umbrales
        </Button>
      </div>
    </div>
  );
}
