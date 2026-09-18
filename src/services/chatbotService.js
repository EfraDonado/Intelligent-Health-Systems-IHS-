import { normalizeText } from "../utils/textNormalize";

// Comentarios humanizados para desarrolladores y mantenedores:
// Este archivo implementa un chatbot regla- basado (sin IA) para IHS.
// Puntos importantes:
// - Hay dos familias de respuestas: `help` (ayuda sobre la app) y
//   `wellness` (consejos generales de bienestar). Las intenciones
//   (intents) se definen abajo como arrays con `keywords` y `answer`.
// - La deteccion de emergencia es sencilla: busca palabras/frases clave
//   que sugieran riesgo inmediato y devuelve un aviso claro para buscar
//   ayuda presencial. Esto no reemplaza juicio medico.
// - Para agregar una nueva intencion: copiar un objeto de `HELP_INTENTS`
//   o `WELLNESS_INTENTS`, elegir un `id`, `keywords` cortos y un `answer`
//   que sea conciso y accionable. Las `quickActions` pueden enlazar rutas.

const WELLNESS_DISCLAIMER = "No reemplaza atencion medica.";

// Palabras clave base para temas de salud y situaciones urgentes.
const EMERGENCY_KEYWORDS = [
  "dolor fuerte",
  "dolor en pecho",
  "dolor en el pecho",
  "no puedo respirar",
  "dificultad para respirar",
  "falta de aire",
  "sin aire",
  "desmayo",
  "convulsion",
  "emergencia",
  "sangrado fuerte",
  "perdi el conocimiento",
  "mareo fuerte",
  "confusion",
  "paralisis",
  "debilidad en un lado",
  "no responde",
];

const GREETING_KEYWORDS = [
  "hola",
  "buenos dias",
  "buenas tardes",
  "buenas noches",
  "buenas",
  "saludos",
];

const THANKS_KEYWORDS = ["gracias", "muchas gracias", "te agradezco", "muy amable"];

const WHO_KEYWORDS = [
  "quien eres",
  "que eres",
  "que puedes hacer",
  "para que sirves",
];

// Intenciones de ayuda de la app (pasos cortos y claros).

const HELP_INTENTS = [
  {
    id: "help_thresholds",
    title: "Configurar umbrales",
    category: "help",
    keywords: ["umbral", "limite", "rango", "minimo", "maximo", "ajustar"],
    answer:
      "En Umbrales ajustas los minimos y maximos de HR y Temp, y el minimo de SpO2. Guarda cambios y el sistema usa esos rangos.",
    quickActions: [{ label: "Ir a Umbrales", to: "/thresholds" }],
  },
  {
    id: "help_reports",
    title: "Generar reportes",
    category: "help",
    keywords: ["reporte", "informe", "pdf", "periodo", "resumen"],
    answer:
      "En Reportes eliges un periodo y luego Generar PDF. Tambien puedes compartir un link simulado.",
    quickActions: [{ label: "Ir a Reportes", to: "/reports" }],
  },
  {
    id: "help_export",
    title: "Exportar datos",
    category: "help",
    keywords: ["exportar", "descargar", "csv", "json", "archivo"],
    answer:
      "En Historial puedes exportar CSV o JSON. En Perfil tienes exportacion rapida de tus datos.",
    quickActions: [
      { label: "Ir a Historial", to: "/history" },
      { label: "Ir a Perfil", to: "/profile" },
    ],
  },
  {
    id: "help_alerts",
    title: "Significado de alertas",
    category: "help",
    keywords: ["alerta", "fuera de rango", "riesgo", "aviso", "tendencia"],
    answer:
      "Una alerta aparece cuando HR, Temp o SpO2 sale del rango, o cuando hay una tendencia. Puedes filtrar y marcarla como revisada.",
    quickActions: [{ label: "Ir a Alertas", to: "/alerts" }],
  },
  {
    id: "help_history",
    title: "Historial y filtros",
    category: "help",
    keywords: ["historial", "filtro", "grafica", "tabla"],
    answer:
      "En Historial filtras por fecha y metrica. La grafica y la tabla se actualizan al instante.",
    quickActions: [{ label: "Ir a Historial", to: "/history" }],
  },
  {
    id: "help_simulator",
    title: "Simulador",
    category: "help",
    keywords: ["simulador", "dispositivo", "conectar", "generar lectura"],
    answer:
      "En Dashboard puedes conectar la fuente simulada y generar lecturas normales o de alerta.",
    quickActions: [{ label: "Ir a Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_manual_reading",
    title: "Lectura manual",
    category: "help",
    keywords: ["manual", "agregar lectura", "ingresar lectura"],
    answer:
      "En Dashboard hay un formulario para agregar lecturas manuales de HR, Temp, SpO2 y RR.",
    quickActions: [{ label: "Ir a Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_demo",
    title: "Modo demo",
    category: "help",
    keywords: ["demo", "probar", "sin cuenta"],
    answer:
      "En Login puedes usar Entrar como demo para practicar sin datos reales.",
    quickActions: [],
  },
  {
    id: "help_profile",
    title: "Perfil y datos",
    category: "help",
    keywords: ["perfil", "datos", "cuenta", "eliminar"],
    answer:
      "En Perfil puedes ver tus datos, exportar JSON y borrar la cuenta local si lo necesitas.",
    quickActions: [{ label: "Ir a Perfil", to: "/profile" }],
  },
  {
    id: "help_recommendations",
    title: "Recomendaciones",
    category: "help",
    keywords: ["recomendacion", "consejo", "ia", "sugerencia"],
    answer:
      "Las recomendaciones aparecen en Dashboard y Reportes. Veras pasos concretos y una prioridad.",
    quickActions: [
      { label: "Ver Dashboard", to: "/dashboard" },
      { label: "Ver Reportes", to: "/reports" },
    ],
  },
  {
    id: "help_spo2",
    title: "SpO2",
    category: "help",
    keywords: ["spo2", "oxigeno", "oxigenacion", "saturacion"],
    answer:
      "SpO2 es la oxigenacion de la sangre en porcentaje. Se muestra en Dashboard y en Historial.",
    quickActions: [{ label: "Ver Historial", to: "/history" }],
  },
  {
    id: "help_rr",
    title: "RR",
    category: "help",
    keywords: ["rr", "respiracion", "respiratoria", "respiraciones"],
    answer:
      "RR es la frecuencia respiratoria (respiraciones por minuto). Si tu fuente no la trae, puede verse vacia.",
    quickActions: [{ label: "Ver Historial", to: "/history" }],
  },
  {
    id: "help_baseline",
    title: "Linea base",
    category: "help",
    keywords: ["linea base", "baseline", "promedio"],
    answer:
      "La linea base usa lecturas en reposo de los ultimos dias para comparar tus valores actuales.",
    quickActions: [{ label: "Ver Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_reminders",
    title: "Recordatorios",
    category: "help",
    keywords: ["recordatorio", "recordatorios", "aviso", "alarma"],
    answer:
      "En Dashboard puedes activar recordatorios suaves cada ciertas horas y guardar un mensaje.",
    quickActions: [{ label: "Configurar recordatorios", to: "/dashboard" }],
  },
  {
    id: "help_source",
    title: "Fuente de datos",
    category: "help",
    keywords: ["fuente", "simulada", "api", "conector"],
    answer:
      "La fuente puede ser simulada o API. Cambias el modo en el simulador del Dashboard.",
    quickActions: [{ label: "Ir a Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_context",
    title: "Contexto de lectura",
    category: "help",
    keywords: ["actividad", "reposo", "estres", "contexto"],
    answer:
      "El contexto indica si estabas en reposo, caminando o en ejercicio. Ayuda a interpretar mejor la lectura.",
    quickActions: [{ label: "Ir a Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_navigation",
    title: "Navegacion",
    category: "help",
    keywords: ["menu", "navegar", "volver", "donde estoy"],
    answer:
      "Usa el menu lateral para moverte. En movil, el menu esta abajo. Siempre puedes volver al Dashboard.",
    quickActions: [{ label: "Volver al Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_ihschat",
    title: "IHSchat",
    category: "help",
    keywords: ["ihschat", "chatbot", "asistente"],
    answer:
      "Soy IHSchat. Puedo explicar pantallas, alertas, reportes y conceptos basicos de bienestar.",
    quickActions: [],
  },
  {
    id: "help_accessibility",
    title: "Ver mejor la pantalla",
    category: "help",
    keywords: ["letra grande", "zoom", "ver mejor", "accesibilidad"],
    answer:
      "Puedes usar el zoom del navegador para agrandar la letra. En computadora es Ctrl + +.",
    quickActions: [],
  },
];

const WELLNESS_INTENTS = [
  {
    id: "well_hydration",
    title: "Hidratacion",
    category: "wellness",
    keywords: ["agua", "hidratacion", "liquidos"],
    answer:
      "Toma agua en pequenos sorbos durante el dia. Si hace calor, aumenta un poco la ingesta.",
  },
  {
    id: "well_sleep",
    title: "Sueño",
    category: "wellness",
    keywords: ["sueño", "dormir", "descanso", "insomnio"],
    answer:
      "Busca un horario regular de sueño. Evita pantallas y cafeina antes de dormir.",
  },
  {
    id: "well_stress",
    title: "Estres",
    category: "wellness",
    keywords: ["estres", "ansiedad", "tension", "preocupado"],
    answer:
      "Prueba pausas cortas, respiracion lenta y estiramientos suaves. Esto ayuda a bajar la tension.",
  },
  {
    id: "well_activity",
    title: "Actividad ligera",
    category: "wellness",
    keywords: ["actividad", "caminar", "ejercicio", "movimiento"],
    answer:
      "Una caminata suave de 20 a 30 minutos al dia ayuda al bienestar general.",
  },
  {
    id: "well_fever",
    title: "Fiebre",
    category: "wellness",
    keywords: ["fiebre", "temperatura alta", "calor"],
    answer:
      "Si hay fiebre, reposo e hidratacion. Si persiste o es alta, consulta a un profesional.",
  },
  {
    id: "well_high_pulse",
    title: "Pulso alto",
    category: "wellness",
    keywords: ["pulso alto", "ritmo cardiaco", "corazon rapido", "taquicardia"],
    answer:
      "Si el pulso esta alto de forma repetida, descansa, respira lento y evita cafeina.",
  },
  {
    id: "well_low_spo2",
    title: "Oxigenacion baja",
    category: "wellness",
    keywords: ["spo2 baja", "oxigeno bajo", "oxigenacion baja", "saturacion baja"],
    answer:
      "Sientate erguido, respira lento y revisa si mejora. Si hay falta de aire, busca ayuda inmediata.",
  },
  {
    id: "well_headache",
    title: "Dolor de cabeza leve",
    category: "wellness",
    keywords: ["dolor de cabeza", "cabeza", "jaqueca", "migrana"],
    answer:
      "Descansa en un lugar tranquilo, toma agua y evita pantallas un rato. Si es muy fuerte o nuevo, consulta.",
  },
  {
    id: "well_dizziness",
    title: "Mareo leve",
    category: "wellness",
    keywords: ["mareo", "mareado", "vertigo", "inestable"],
    answer:
      "Sientate, respira lento y toma agua. Si el mareo es fuerte o hay desmayo, busca ayuda inmediata.",
  },
  {
    id: "well_cramps",
    title: "Calambres",
    category: "wellness",
    keywords: ["calambre", "calambres", "musculo"],
    answer:
      "Estira suave el musculo y toma agua. Un descanso corto suele ayudar.",
  },
  {
    id: "well_nutrition",
    title: "Alimentacion ligera",
    category: "wellness",
    keywords: ["alimentacion", "comida", "apetito", "nutricion", "desayuno"],
    answer:
      "Prefiere comidas ligeras y regulares. Frutas, verduras y proteinas suaves ayudan al bienestar.",
  },
  {
    id: "well_medication",
    title: "Medicacion",
    category: "wellness",
    keywords: ["medicacion", "medicina", "pastilla", "dosis", "tratamiento"],
    answer:
      "Sigue las indicaciones del profesional. No cambies dosis sin orientacion.",
  },
  {
    id: "well_posture",
    title: "Postura y cuello",
    category: "wellness",
    keywords: ["postura", "espalda", "cuello", "tension cuello"],
    answer:
      "Ajusta la postura, apoya la espalda y haz estiramientos suaves cada cierto tiempo.",
  },
  {
    id: "well_pressure",
    title: "Presion arterial",
    category: "wellness",
    keywords: ["presion", "tension arterial", "presion alta", "presion baja"],
    answer:
      "Si mides presion, siientate 5 minutos antes y repite la lectura para confirmar. Consulta si es persistente.",
  },
  {
    id: "well_consult",
    title: "Cuando consultar",
    category: "wellness",
    keywords: ["consultar", "doctor", "profesional", "preocupante"],
    answer:
      "Si notas sintomas fuertes o que no mejoran, busca orientacion profesional.",
  },
  {
    id: "well_breathing",
    title: "Respiracion",
    category: "wellness",
    keywords: ["respirar", "respiracion", "calmar"],
    answer:
      "Prueba 4-4-6: inhala 4, manten 4, exhala 6. Repite varias veces.",
  },
];

const FAQS = [
  { id: "faq-1", question: "Como configuro umbrales?", intentId: "help_thresholds" },
  { id: "faq-2", question: "Como genero un PDF?", intentId: "help_reports" },
  { id: "faq-3", question: "Como exporto CSV o JSON?", intentId: "help_export" },
  { id: "faq-4", question: "Que hago si sale una alerta?", intentId: "help_alerts" },
  { id: "faq-5", question: "Como uso el historial?", intentId: "help_history" },
  { id: "faq-6", question: "Como funciona el simulador?", intentId: "help_simulator" },
  { id: "faq-7", question: "Como agrego lectura manual?", intentId: "help_manual_reading" },
  { id: "faq-8", question: "Donde veo recomendaciones?", intentId: "help_recommendations" },
  { id: "faq-9", question: "Como exporto mis datos?", intentId: "help_profile" },
  { id: "faq-10", question: "Como borro mi cuenta?", intentId: "help_profile" },
  { id: "faq-11", question: "Que es el modo demo?", intentId: "help_demo" },
  { id: "faq-12", question: "Como comparto un reporte?", intentId: "help_reports" },
  { id: "faq-13", question: "Que es SpO2?", intentId: "help_spo2" },
  { id: "faq-14", question: "Que es RR?", intentId: "help_rr" },
  { id: "faq-15", question: "Que es la linea base?", intentId: "help_baseline" },
  { id: "faq-16", question: "Como activo recordatorios?", intentId: "help_reminders" },
  { id: "faq-17", question: "Como cambio la fuente de datos?", intentId: "help_source" },
  { id: "faq-18", question: "Como usar IHSchat?", intentId: "help_ihschat" },
];

const QUICK_CHIPS = [
  { label: "Configurar umbrales", message: "Como configuro umbrales" },
  { label: "Generar reporte", message: "Como genero un reporte" },
  { label: "Exportar datos", message: "Como exporto datos" },
  { label: "Que significa una alerta", message: "Que significa una alerta" },
  { label: "Recordatorios", message: "Como activo recordatorios" },
  { label: "Linea base", message: "Que es la linea base" },
  { label: "SpO2", message: "Que es SpO2" },
];

const FALLBACK_HELP = {
  text: "No encontre eso aun. Puedo ayudarte con umbrales, alertas, reportes, historial, SpO2 o recordatorios.",
  suggestions: [
    { label: "Umbrales", message: "Como configuro umbrales" },
    { label: "Reportes", message: "Como genero un reporte" },
    { label: "Exportar", message: "Como exporto datos" },
    { label: "Alertas", message: "Que significa una alerta" },
  ],
};

const FALLBACK_WELLNESS = {
  text: "Puedo darte consejos generales de bienestar. Prueba con hidratacion, sueño o estres.",
  suggestions: [
    { label: "Hidratacion", message: "Consejos de hidratacion" },
    { label: "Sueño", message: "Consejos de sueño" },
    { label: "Estres", message: "Como bajar el estres" },
    { label: "Actividad", message: "Actividad ligera" },
  ],
  disclaimer: WELLNESS_DISCLAIMER,
};

// scoreIntent: calcula una puntuacion sencilla para una intent
// sumando 1 por cada palabra clave que aparezca en el mensaje.
// Esta simplicidad facilita entender por que una respuesta fue elegida.
function scoreIntent(normalizedMessage, intent) {
  return intent.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return normalizedMessage.includes(normalizedKeyword) ? score + 1 : score;
  }, 0);
}

// includesAny: helper para chequear listas de palabras cortas
// (saludos, agradecimientos, etc.). Devuelve true si alguna coincide.
function includesAny(normalizedMessage, keywords) {
  return keywords.some((keyword) =>
    normalizedMessage.includes(normalizeText(keyword))
  );
}

// detectEmergency: identifica frases que sugieren riesgo inmediato.
// Si devuelve true, el bot responde pidiendo asistencia presencial.
export function detectEmergency(message) {
  const normalized = normalizeText(message);
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function getFaqs() {
  return FAQS;
}

export function getQuickChips() {
  return QUICK_CHIPS;
}

export function getIntentById(intentId) {
  return [...HELP_INTENTS, ...WELLNESS_INTENTS].find((intent) => intent.id === intentId);
}

// buildResponseFromIntent: empaqueta la respuesta final que se mostrara
// en la UI. Incluye texto, posibles acciones rapidas y un disclaimer
// cuando la categoria es wellness para recordar limites de uso.
export function buildResponseFromIntent(intent) {
  if (!intent) return { text: FALLBACK_HELP.text, suggestions: FALLBACK_HELP.suggestions };
  return {
    text: intent.answer,
    actions: intent.quickActions || [],
    disclaimer: intent.category === "wellness" ? WELLNESS_DISCLAIMER : null,
    intentId: intent.id,
  };
}

// getBotResponse: flujo principal del bot.
// Orden de operaciones y razones:
// 1) Mensaje vacio -> sugerencias por categoria.
// 2) Saludos / quien eres / gracias -> respuestas cortas y utiles.
// 3) Emergencia -> prioritaria, pedir ayuda presencial.
// 4) Matching de intents por keywords -> elegir la mejor puntuacion.
// 5) Si no hay coincidencias, devolver fallback apropiado.
export function getBotResponse({ message, category }) {
  const normalized = normalizeText(message);
  if (!normalized) return category === "wellness" ? FALLBACK_WELLNESS : FALLBACK_HELP;

  // Respuestas humanas y amables para interacciones basicas.
  if (includesAny(normalized, GREETING_KEYWORDS)) {
    return {
      text: "Hola, soy IHSchat. Puedo guiarte por la app o darte consejos simples de bienestar.",
      suggestions: getQuickChips(),
    };
  }

  if (includesAny(normalized, WHO_KEYWORDS)) {
    return {
      text: "Soy IHSchat, un asistente que explica pantallas, alertas y recomendaciones de IHS.",
      suggestions: getQuickChips(),
    };
  }

  if (includesAny(normalized, THANKS_KEYWORDS)) {
    return {
      text: "Con gusto. Si quieres, dime que necesitas y te guio paso a paso.",
      suggestions: getQuickChips(),
    };
  }

  // Emergencias: notificar con claridad y mostrar disclaimer.
  if (detectEmergency(normalized)) {
    return {
      text: "Lo siento, esto suena urgente. Busca atencion medica inmediata o emergencias locales.",
      disclaimer: WELLNESS_DISCLAIMER,
    };
  }

  // Buscamos la mejor intent basada en las keywords
  const intents = category === "wellness" ? WELLNESS_INTENTS : HELP_INTENTS;
  let bestIntent = null;
  let bestScore = 0;

  intents.forEach((intent) => {
    const score = scoreIntent(normalized, intent);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  // Si no hay matches, devolvemos fallback contextual.
  if (!bestIntent || bestScore === 0) {
    return category === "wellness" ? FALLBACK_WELLNESS : FALLBACK_HELP;
  }

  return buildResponseFromIntent(bestIntent);
}
