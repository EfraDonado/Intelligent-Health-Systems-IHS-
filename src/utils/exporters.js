export function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportJSON(filename, data) {
  downloadFile(filename, JSON.stringify(data, null, 2), "application/json");
}

export function exportCSV(filename, rows) {
  if (!rows.length) {
    downloadFile(filename, "", "text/csv");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(
      rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            const safe = String(value).replace(/"/g, '""');
            return `"${safe}"`;
          })
          .join(",")
      )
    )
    .join("\n");
  downloadFile(filename, csv, "text/csv");
}
