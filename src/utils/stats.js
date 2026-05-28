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
    spo2: calcStats(readings.map((reading) => reading.spo2)),
    rr: calcStats(readings.map((reading) => reading.rr)),
  };
}

export function calcBaseline(readings, days = 7) {
  if (!readings.length) {
    return {
      samples: 0,
      hr: { min: null, max: null, avg: null },
      temp: { min: null, max: null, avg: null },
      spo2: { min: null, max: null, avg: null },
      rr: { min: null, max: null, avg: null },
    };
  }

  const windowStart = Date.now() - days * 24 * 60 * 60 * 1000;
  const samples = readings.filter((reading) => {
    const time = new Date(reading.timestampISO).getTime();
    return (
      Number.isFinite(time) &&
      time >= windowStart &&
      reading.context?.activity === "reposo"
    );
  });

  const stats = calcReadingStats(samples);
  return {
    samples: samples.length,
    ...stats,
  };
}

export function compareWithBaseline(latest, baseline) {
  if (!latest || !baseline?.samples) return null;

  const delta = (value, avg) => {
    if (value === null || value === undefined || avg === null || avg === undefined) {
      return null;
    }
    return value - avg;
  };

  return {
    hr: delta(latest.hr, baseline.hr.avg),
    temp: delta(latest.temp, baseline.temp.avg),
    spo2: delta(latest.spo2, baseline.spo2.avg),
    rr: delta(latest.rr, baseline.rr.avg),
  };
}
