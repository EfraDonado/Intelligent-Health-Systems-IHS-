import { jsPDF } from "jspdf";
import { calcReadingStats } from "../utils/stats";
import { formatDate, formatDateTime } from "../utils/formatters";

export function buildReportData(readings, alerts) {
  const stats = calcReadingStats(readings);
  return {
    stats,
    alertCount: alerts.length,
  };
}

function formatStat(value, digits = 1) {
  if (value === null || Number.isNaN(value)) return "-";
  return Number(value).toFixed(digits);
}

function drawMiniChart(doc, readings, startX, startY) {
  if (!readings.length) return;
  const width = 160;
  const height = 40;
  const maxPoints = 12;
  const points = readings.slice(0, maxPoints).reverse();
  const hrValues = points.map((item) => item.hr);
  const tempValues = points.map((item) => item.temp);

  const hrMin = Math.min(...hrValues);
  const hrMax = Math.max(...hrValues);
  const tempMin = Math.min(...tempValues);
  const tempMax = Math.max(...tempValues);

  const scaleX = width / (points.length - 1 || 1);
  const scaleY = (value, min, max) => {
    if (max === min) return height / 2;
    return height - ((value - min) / (max - min)) * height;
  };

  doc.setDrawColor(37, 99, 235);
  points.forEach((point, index) => {
    if (index === 0) return;
    const prev = points[index - 1];
    doc.line(
      startX + (index - 1) * scaleX,
      startY + scaleY(prev.hr, hrMin, hrMax),
      startX + index * scaleX,
      startY + scaleY(point.hr, hrMin, hrMax)
    );
  });

  doc.setDrawColor(34, 197, 94);
  points.forEach((point, index) => {
    if (index === 0) return;
    const prev = points[index - 1];
    doc.line(
      startX + (index - 1) * scaleX,
      startY + scaleY(prev.temp, tempMin, tempMax),
      startX + index * scaleX,
      startY + scaleY(point.temp, tempMin, tempMax)
    );
  });
}

export function generatePDF({ user, period, readings, alerts, stats, recommendations }) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte SaludIA", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Usuario: ${user?.name || "-"}`, 14, 26);
  doc.text(
    `Periodo: ${formatDate(period.start)} - ${formatDate(period.end)}`,
    14,
    32
  );
  doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, 14, 38);

  doc.setFont("helvetica", "bold");
  doc.text("Resumen rapido", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Alertas en periodo: ${alerts.length}`, 14, 58);
  doc.text(`HR min/max: ${formatStat(stats.hr.min, 0)} / ${formatStat(stats.hr.max, 0)}`, 14, 64);
  doc.text(`HR promedio: ${formatStat(stats.hr.avg, 0)}`, 14, 70);
  doc.text(
    `Temp min/max: ${formatStat(stats.temp.min)} / ${formatStat(stats.temp.max)}`,
    14,
    76
  );
  doc.text(`Temp promedio: ${formatStat(stats.temp.avg)}`, 14, 82);

  doc.setFont("helvetica", "bold");
  doc.text("Grafica simplificada (HR y Temp)", 14, 96);
  doc.setDrawColor(255, 255, 255);
  doc.rect(14, 100, 180, 50);
  drawMiniChart(doc, readings, 18, 104);

  let cursorY = 156;
  doc.setFont("helvetica", "bold");
  doc.text("Alertas del periodo", 14, cursorY);
  cursorY += 8;
  doc.setFont("helvetica", "normal");
  if (!alerts.length) {
    doc.text("- Sin alertas registradas.", 14, cursorY);
    cursorY += 6;
  } else {
    alerts.slice(0, 5).forEach((alert) => {
      const label = alert.parameter === "hr" ? "HR" : "Temp";
      doc.text(
        `- ${label} ${alert.value} (rango ${alert.min}-${alert.max})`,
        14,
        cursorY
      );
      cursorY += 6;
    });
  }

  cursorY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Recomendaciones", 14, cursorY);
  cursorY += 8;
  doc.setFont("helvetica", "normal");
  recommendations.slice(0, 4).forEach((text) => {
    doc.text(`- ${text}`, 14, cursorY);
    cursorY += 6;
  });

  doc.setFont("helvetica", "italic");
  doc.text("Apoyo informativo, no diagnostico medico.", 14, 238);

  doc.save(`saludia-reporte-${Date.now()}.pdf`);
}
