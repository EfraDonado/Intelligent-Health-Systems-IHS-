function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calcStats(values) {
  if (!values.length) return { min: null, max: null, avg: null };
  const nums = values.map(safeNumber).filter((value) => value !== null);
  if (!nums.length) return { min: null, max: null, avg: null };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const avg = nums.reduce((acc, value) => acc + value, 0) / nums.length;
  return { min, max, avg };
}

export function calcReadingStats(readings) {
  return {
    hr: calcStats(readings.map((reading) => reading.hr)),
    temp: calcStats(readings.map((reading) => reading.temp)),
  };
}
