function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, digits = 1) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(digits));
}

export function generateRandomReading(thresholds, mode = "normal") {
  const hrBaseMin = thresholds.hrMin + 4;
  const hrBaseMax = thresholds.hrMax - 4;
  const tempBaseMin = thresholds.tempMin + 0.2;
  const tempBaseMax = thresholds.tempMax - 0.2;

  const safeHrMin = Math.min(hrBaseMin, hrBaseMax);
  const safeHrMax = Math.max(hrBaseMin, hrBaseMax);
  const safeTempMin = Math.min(tempBaseMin, tempBaseMax);
  const safeTempMax = Math.max(tempBaseMin, tempBaseMax);

  let hr = randomInt(safeHrMin, safeHrMax);
  let temp = randomFloat(safeTempMin, safeTempMax, 1);

  if (mode === "alert") {
    if (Math.random() > 0.5) {
      hr = Math.random() > 0.5 ? thresholds.hrMax + randomInt(8, 20) : thresholds.hrMin - randomInt(5, 15);
    } else {
      temp = Math.random() > 0.5 ? thresholds.tempMax + randomFloat(0.6, 1.4, 1) : thresholds.tempMin - randomFloat(0.6, 1.2, 1);
    }
  }

  return {
    hr: clamp(hr, 30, 220),
    temp: clamp(temp, 34, 41),
  };
}
