import { jsPDF } from "jspdf";
import { calcReadingStats } from "../utils/stats";
import { formatDate, formatDateTime } from "../utils/formatters";

export function buildReportData(readings, alerts, baseline = null) {
  const stats = calcReadingStats(readings);
  return {
    stats,
    alertCount: alerts.length,
    baseline,
  };
}

function formatStat(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Number(value).toFixed(digits);
}

function drawMiniChart(doc, readings, startX, startY) {
  if (!readings.length) return;
  const width = 160;
  const height = 40;
  const maxPoints = 12;
  const points = readings.slice(0, maxPoints).reverse();

  const series = [
    { key: "hr", color: [37, 99, 235] },
    { key: "temp", color: [34, 197, 94] },
    { key: "spo2", color: [14, 165, 233] },
  ];

  const scaleX = width / (points.length - 1 || 1);
  const scaleY = (value, min, max) => {
    if (max === min) return height / 2;
    return height - ((value - min) / (max - min)) * height;
  };

  const drawLine = (key, color) => {
    const values = points.map((item) => item[key]).filter((value) => value !== null);
    if (values.length < 2) return;
    const min = Math.min(...values);
    const max = Math.max(...values);
    doc.setDrawColor(...color);

    points.forEach((point, index) => {
      if (index === 0 || point[key] === null) return;
      const prev = points[index - 1];
      if (!prev || prev[key] === null) return;
      doc.line(
        startX + (index - 1) * scaleX,
        startY + scaleY(prev[key], min, max),
        startX + index * scaleX,
        startY + scaleY(point[key], min, max)
      );
    });
  };

  series.forEach(({ key, color }) => drawLine(key, color));
}

function formatRecommendationLine(item) {
  if (!item) return "";
  if (typeof item === "string") return item;

  const summary = item.summary || item.title || "";
  const step = item.steps?.[0];
  const timeframe = item.timeframe ? ` (${item.timeframe})` : "";
  if (step) {
    return `${summary} Paso 1: ${step}${timeframe}`;
  }
  return `${summary}${timeframe}`.trim();
}

export function generatePDF({ user, period, readings, alerts, stats, recommendations }) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte IHS", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Usuario: ${user?.name || "-"}`, 14, 26);
  doc.text(`Periodo: ${formatDate(period.start)} - ${formatDate(period.end)}`, 14, 32);
  doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, 14, 38);

  doc.setFont("helvetica", "bold");
  doc.text("Resumen rapido", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Alertas en periodo: ${alerts.length}`, 14, 58);
  doc.text(`HR min/max: ${formatStat(stats.hr.min, 0)} / ${formatStat(stats.hr.max, 0)}`, 14, 64);
  doc.text(`HR promedio: ${formatStat(stats.hr.avg, 0)}`, 14, 70);
  doc.text(`Temp min/max: ${formatStat(stats.temp.min)} / ${formatStat(stats.temp.max)}`, 14, 76);
  doc.text(`Temp promedio: ${formatStat(stats.temp.avg)}`, 14, 82);
  doc.text(`SpO2 min/max: ${formatStat(stats.spo2.min, 0)} / ${formatStat(stats.spo2.max, 0)}`, 14, 88);
  doc.text(`SpO2 promedio: ${formatStat(stats.spo2.avg, 0)}`, 14, 94);
  if (stats.rr.avg !== null) {
    doc.text(`RR promedio: ${formatStat(stats.rr.avg, 0)}`, 14, 100);
  }

  doc.setFont("helvetica", "bold");
  doc.text("Grafica simplificada", 14, 114);
  doc.setDrawColor(255, 255, 255);
  doc.rect(14, 118, 180, 50);
  drawMiniChart(doc, readings, 18, 122);

  let cursorY = 176;
  doc.setFont("helvetica", "bold");
  doc.text("Alertas del periodo", 14, cursorY);
  cursorY += 8;
  doc.setFont("helvetica", "normal");
  if (!alerts.length) {
    doc.text("- Sin alertas registradas.", 14, cursorY);
    cursorY += 6;
  } else {
    alerts.slice(0, 5).forEach((alert) => {
      const label =
        alert.kind === "trend"
          ? "Tendencia"
          : alert.parameter === "hr"
            ? "HR"
            : alert.parameter === "temp"
              ? "Temp"
              : "SpO2";
      doc.text(
        `- ${label} ${alert.value} | ${alert.note || "Lectura fuera de rango."}`,
        14,
        cursorY
      );
      cursorY += 6;
    });
  }

  cursorY += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Recomendaciones", 14, cursorY);
  cursorY += 8;
  doc.setFont("helvetica", "normal");
  const recommendationItems = recommendations?.items || recommendations || [];
  recommendationItems
    .map((item) => formatRecommendationLine(item))
    .filter(Boolean)
    .slice(0, 4)
    .forEach((text) => {
      doc.text(`- ${text}`, 14, cursorY);
      cursorY += 6;
    });

  doc.setFont("helvetica", "italic");
  doc.text("Apoyo informativo, no diagnostico.", 14, 286);

  doc.save(`ihs-reporte-${Date.now()}.pdf`);
}
