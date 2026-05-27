import { normalizeText } from "../utils/textNormalize";

const WELLNESS_DISCLAIMER = "No reemplaza atencion medica.";

const EMERGENCY_KEYWORDS = [
  "dolor fuerte",
  "dolor en pecho",
  "no puedo respirar",
  "dificultad para respirar",
  "desmayo",
  "convulsion",
  "emergencia",
  "sangrado fuerte",
  "perdi el conocimiento",
];

const HELP_INTENTS = [
  {
    id: "help_thresholds",
    title: "Configurar umbrales",
    category: "help",
    keywords: ["umbral", "limite", "rango", "minimo", "maximo", "ajustar"],
    answer:
      "En Umbrales ajustas los minimos y maximos de HR y Temp. Guarda cambios y el sistema usa esos rangos.",
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
    keywords: ["alerta", "fuera de rango", "riesgo", "aviso"],
    answer:
      "Una alerta aparece cuando HR o Temp sale del rango. Puedes marcarla como revisada cuando la hayas visto.",
    quickActions: [{ label: "Ir a Alertas", to: "/alerts" }],
  },
  {
    id: "help_history",
    title: "Historial y filtros",
    category: "help",
    keywords: ["historial", "filtro", "grafica", "tabla"],
    answer:
      "En Historial filtras por fecha y parametro. La grafica y la tabla se actualizan automaticamente.",
    quickActions: [{ label: "Ir a Historial", to: "/history" }],
  },
  {
    id: "help_simulator",
    title: "Simulador",
    category: "help",
    keywords: ["simulador", "dispositivo", "conectar", "generar lectura"],
    answer:
      "En Dashboard puedes conectar el dispositivo simulado y generar lecturas normales o de alerta.",
    quickActions: [{ label: "Ir a Dashboard", to: "/dashboard" }],
  },
  {
    id: "help_manual_reading",
    title: "Lectura manual",
    category: "help",
    keywords: ["manual", "agregar lectura", "ingresar lectura"],
    answer:
      "En Dashboard hay un formulario para agregar lecturas manuales de HR y Temp.",
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
      "Las recomendaciones se muestran en Dashboard y tambien en Reportes.",
    quickActions: [
      { label: "Ver Dashboard", to: "/dashboard" },
      { label: "Ver Reportes", to: "/reports" },
    ],
  },
];

const WELLNESS_INTENTS = [
  {
    id: "well_hydration",
    title: "Hidratacion",
    category: "wellness",
    keywords: ["agua", "hidratacion", "liquidos"],
    answer:
      "Toma agua en pequenos sorbos durante el dia. Si hace calor, aumenta la ingesta.",
  },
  {
    id: "well_sleep",
    title: "Sueno",
    category: "wellness",
    keywords: ["sueno", "dormir", "descanso", "insomnio"],
    answer:
      "Busca un horario regular de sueno y evita pantallas justo antes de dormir.",
  },
  {
    id: "well_stress",
    title: "Estres",
    category: "wellness",
    keywords: ["estres", "ansiedad", "tension", "preocupado"],
    answer:
      "Prueba pausas cortas, respiracion lenta y estiramientos suaves. Ayuda a bajar la tension.",
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
];

const QUICK_CHIPS = [
  { label: "Configurar umbrales", message: "Como configuro umbrales" },
  { label: "Generar reporte", message: "Como genero un reporte" },
  { label: "Exportar datos", message: "Como exporto datos" },
  { label: "Que significa una alerta", message: "Que significa una alerta" },
];

const FALLBACK_HELP = {
  text: "No encontre eso aun. Puedo ayudarte con umbrales, alertas, reportes o exportacion.",
  suggestions: [
    { label: "Umbrales", message: "Como configuro umbrales" },
    { label: "Reportes", message: "Como genero un reporte" },
    { label: "Exportar", message: "Como exporto datos" },
    { label: "Alertas", message: "Que significa una alerta" },
  ],
};

const FALLBACK_WELLNESS = {
  text: "Puedo darte consejos generales de bienestar. Prueba con hidratacion, sueno o estres.",
  suggestions: [
    { label: "Hidratacion", message: "Consejos de hidratacion" },
    { label: "Sueno", message: "Consejos de sueno" },
    { label: "Estres", message: "Como bajar el estres" },
    { label: "Actividad", message: "Actividad ligera" },
  ],
  disclaimer: WELLNESS_DISCLAIMER,
};

function scoreIntent(normalizedMessage, intent) {
  return intent.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return normalizedMessage.includes(normalizedKeyword) ? score + 1 : score;
  }, 0);
}

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

export function buildResponseFromIntent(intent) {
  if (!intent) return { text: FALLBACK_HELP.text, suggestions: FALLBACK_HELP.suggestions };
  return {
    text: intent.answer,
    actions: intent.quickActions || [],
    disclaimer: intent.category === "wellness" ? WELLNESS_DISCLAIMER : null,
    intentId: intent.id,
  };
}

export function getBotResponse({ message, category }) {
  const normalized = normalizeText(message);
  if (!normalized) return category === "wellness" ? FALLBACK_WELLNESS : FALLBACK_HELP;

  if (detectEmergency(normalized)) {
    return {
      text: "Lo siento, esto suena urgente. Busca atencion medica inmediata o emergencias locales.",
      disclaimer: WELLNESS_DISCLAIMER,
    };
  }

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

  if (!bestIntent || bestScore === 0) {
    return category === "wellness" ? FALLBACK_WELLNESS : FALLBACK_HELP;
  }

  return buildResponseFromIntent(bestIntent);
}
