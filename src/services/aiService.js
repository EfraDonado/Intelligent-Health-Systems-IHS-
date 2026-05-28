const DAY_MS = 24 * 60 * 60 * 1000;

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item) return false;
    const id = typeof item === "string" ? item : item.id || item.title || item.summary;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function makeRecommendation({
  id,
  title,
  summary,
  steps = [],
  priority = "low",
  timeframe = "Hoy",
  category = "general",
  followUp = "",
}) {
  return {
    id,
    title,
    summary,
    steps,
    priority,
    timeframe,
    category,
    followUp,
  };
}

export function generateRecommendations(
  readings,
  alerts,
  thresholds,
  baseline = null,
  baselineDelta = null
) {
  if (!readings.length) {
    return {
      items: [
        makeRecommendation({
          id: "first-reading",
          title: "Genera tu primera lectura",
          summary: "Necesitas al menos una lectura para activar el resumen.",
          steps: [
            "Ve al Dashboard.",
            "Pulsa Generar lectura o agrega una manual.",
            "Revisa el resumen y la grafica.",
          ],
          priority: "medium",
          timeframe: "Ahora",
          category: "inicio",
        }),
        makeRecommendation({
          id: "demo-data",
          title: "Practica con datos demo",
          summary: "Puedes ver todo el flujo sin datos reales.",
          steps: [
            "En el Dashboard pulsa Cargar datos demo.",
            "Abre Historial para ver varias lecturas.",
          ],
          priority: "low",
          timeframe: "Cuando quieras",
          category: "inicio",
        }),
        makeRecommendation({
          id: "enable-reminders",
          title: "Activa recordatorios suaves",
          summary: "Un aviso simple ayuda a no olvidar las lecturas.",
          steps: [
            "En Dashboard ve a Recordatorios.",
            "Elige cada cuantas horas y guarda.",
          ],
          priority: "low",
          timeframe: "Hoy",
          category: "habitos",
        }),
      ],
      disclaimer: "Apoyo informativo, no diagnostico.",
    };
  }

  const tips = [];
  const recent = readings.slice(0, 8);
  const last6h = readings.filter(
    (item) => Date.now() - new Date(item.timestampISO).getTime() <= 6 * 60 * 60 * 1000
  );

  const tempHighCount = last6h.filter((item) => item.temp !== null && item.temp >= 38).length;
  const spo2LowCount = recent.filter(
    (item) => item.spo2 !== null && item.spo2 < thresholds.spo2Min
  ).length;
  const alerts24h = alerts.filter(
    (alert) => Date.now() - new Date(alert.timestampISO).getTime() <= DAY_MS
  ).length;

  if (tempHighCount >= 2) {
    tips.push(
      makeRecommendation({
        id: "temp-high",
        title: "Temperatura alta repetida",
        summary: "Se detectaron varias lecturas de temperatura alta en pocas horas.",
        steps: [
          "Descansa en un lugar fresco.",
          "Toma agua en pequenos sorbos.",
          "Revisa la temperatura en 30 a 60 minutos.",
        ],
        priority: "high",
        timeframe: "Hoy",
        category: "salud",
        followUp: "Si la temperatura sigue alta o hay malestar fuerte, consulta.",
      })
    );
  }
  if (alerts24h >= 3) {
    tips.push(
      makeRecommendation({
        id: "alerts-24h",
        title: "Varias alertas recientes",
        summary: "Hubo varias alertas en las ultimas 24 horas.",
        steps: [
          "Revisa la lista de alertas y su contexto.",
          "Anota que estabas haciendo en ese momento.",
          "Si se repite, guarda un reporte para seguimiento.",
        ],
        priority: "medium",
        timeframe: "Hoy",
        category: "seguimiento",
      })
    );
  }

  let restHrHighStreak = 0;
  for (const reading of readings) {
    if (reading.context?.activity !== "reposo") break;
    if (reading.hr !== null && reading.hr > thresholds.hrMax) {
      restHrHighStreak += 1;
    } else {
      break;
    }
  }

  if (restHrHighStreak >= 3) {
    tips.push(
      makeRecommendation({
        id: "rest-hr-high",
        title: "Pulso alto en reposo",
        summary: "Se detecto pulso alto en varias lecturas en reposo.",
        steps: [
          "Si estas sentado, prueba respirar lento 3 minutos.",
          "Evita cafe o esfuerzo por un rato.",
          "Revisa una nueva lectura mas tarde.",
        ],
        priority: "medium",
        timeframe: "Hoy",
        category: "salud",
      })
    );
  }

  if (spo2LowCount >= 2) {
    tips.push(
      makeRecommendation({
        id: "spo2-low",
        title: "Oxigenacion baja repetida",
        summary: "La SpO2 estuvo por debajo del minimo en varias lecturas.",
        steps: [
          "Sientate erguido y respira lento.",
          "Evita esfuerzo y revisa de nuevo en 10 a 15 minutos.",
        ],
        priority: "high",
        timeframe: "Hoy",
        category: "salud",
        followUp: "Si no mejora o hay falta de aire, consulta de inmediato.",
      })
    );
  }

  const stressedReading = recent.find(
    (item) => item.context?.stress === "alto" && item.hr !== null && item.hr > thresholds.hrMax
  );
  if (stressedReading) {
    tips.push(
      makeRecommendation({
        id: "stress-high",
        title: "Estres alto detectado",
        summary: "Hay lecturas con estres alto y pulso elevado.",
        steps: [
          "Haz una pausa corta.",
          "Respira 4 segundos, manten 4, exhala 6.",
          "Revisa de nuevo cuando te sientas mas tranquilo.",
        ],
        priority: "medium",
        timeframe: "Ahora",
        category: "bienestar",
      })
    );
  }

  const afterExercise = recent.find((item) => item.context?.activity === "ejercicio");
  if (afterExercise) {
    tips.push(
      makeRecommendation({
        id: "after-exercise",
        title: "Despues del ejercicio",
        summary: "Es normal que el pulso suba por un rato tras ejercitar.",
        steps: [
          "Espera 10 a 20 minutos antes de comparar.",
          "Hidrata y descansa un momento.",
        ],
        priority: "low",
        timeframe: "Hoy",
        category: "habitos",
      })
    );
  }

  if (baseline?.samples && baselineDelta) {
    if (baselineDelta.temp !== null && baselineDelta.temp >= 0.3) {
      tips.push(
        makeRecommendation({
          id: "baseline-temp",
          title: "Temperatura sobre tu linea base",
          summary: "La temperatura actual esta por encima de tu promedio de reposo.",
          steps: [
            "Observa si se mantiene durante varias lecturas.",
            "Registra el contexto (reposo, estres, ejercicio).",
          ],
          priority: "medium",
          timeframe: "Proximas 24 horas",
          category: "seguimiento",
        })
      );
    }
    if (baselineDelta.spo2 !== null && baselineDelta.spo2 <= -1) {
      tips.push(
        makeRecommendation({
          id: "baseline-spo2",
          title: "SpO2 por debajo de tu linea base",
          summary: "La oxigenacion esta un poco mas baja que tu promedio.",
          steps: [
            "Descansa y revisa una nueva lectura mas tarde.",
            "Si estas caminando, toma la lectura en reposo.",
          ],
          priority: "medium",
          timeframe: "Hoy",
          category: "seguimiento",
        })
      );
    }
    if (baselineDelta.rr !== null && baselineDelta.rr >= 2) {
      tips.push(
        makeRecommendation({
          id: "baseline-rr",
          title: "Respiracion mas rapida de lo usual",
          summary: "La frecuencia respiratoria esta por encima de tu linea base.",
          steps: [
            "Sientate y respira lento por 2 minutos.",
            "Revisa de nuevo cuando te sientas mas calmado.",
          ],
          priority: "low",
          timeframe: "Hoy",
          category: "bienestar",
        })
      );
    }
  }

  tips.push(
    makeRecommendation({
      id: "general-habits",
      title: "Habitos que ayudan",
      summary: "Hidratacion, sueno y pausas cortas suelen estabilizar lecturas.",
      steps: [
        "Toma agua durante el dia.",
        "Duerme en horarios regulares.",
        "Haz pausas suaves si estas sentado mucho tiempo.",
      ],
      priority: "low",
      timeframe: "Cada dia",
      category: "habitos",
    })
  );

  return {
    items: uniqueById(tips).slice(0, 6),
    disclaimer: "Apoyo informativo, no diagnostico.",
  };
}
