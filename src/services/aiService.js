const DAY_MS = 24 * 60 * 60 * 1000;

export function generateRecommendations(readings, alerts, thresholds) {
  if (!readings.length) {
    return [
      "Aun no hay lecturas, genera una para empezar.",
      "Recuerda: esto es apoyo, no diagnostico medico.",
    ];
  }

  const tips = [];
  const recent = readings.slice(0, 6);
  const tempHighCount = recent.filter((item) => item.temp >= 38).length;
  const hrOutCount = recent.filter(
    (item) => item.hr < thresholds.hrMin || item.hr > thresholds.hrMax
  ).length;
  const last24Alerts = alerts.filter(
    (alert) => Date.now() - new Date(alert.timestampISO).getTime() <= DAY_MS
  ).length;

  if (tempHighCount >= 2) {
    tips.push(
      "Se detecta temperatura alta en varias lecturas. Considera reposo y seguimiento."
    );
  }
  if (last24Alerts >= 3) {
    tips.push(
      "Hay varias alertas en 24h. Registra sintomas y observa la tendencia."
    );
  }
  if (hrOutCount >= 2) {
    tips.push(
      "Ritmo cardiaco fuera de rango de forma repetida. Descanso y observacion si persiste."
    );
  }

  tips.push("Hidratacion y pausas cortas ayudan a estabilizar lecturas.");
  return tips;
}
