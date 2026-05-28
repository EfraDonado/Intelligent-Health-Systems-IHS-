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

function getRangeByContext(activity) {
  switch (activity) {
    case "ejercicio":
      return {
        hr: [100, 145],
        temp: [36.8, 38.0],
        spo2: [94, 99],
        rr: [18, 26],
      };
    case "caminando":
      return {
        hr: [78, 108],
        temp: [36.4, 37.4],
        spo2: [95, 99],
        rr: [14, 22],
      };
    default:
      return {
        hr: [60, 84],
        temp: [36.2, 37.1],
        spo2: [96, 100],
        rr: [10, 18],
      };
  }
}

export function generateRandomVitals(thresholds, options = {}) {
  const { scenario = "normal", context = {} } = options;
  const activity = context.activity || "reposo";
  const base = getRangeByContext(activity);

  const hrBaseMin = base.hr[0];
  const hrBaseMax = base.hr[1];
  const tempBaseMin = base.temp[0];
  const tempBaseMax = base.temp[1];
  const spo2BaseMin = base.spo2[0];
  const spo2BaseMax = base.spo2[1];
  const rrBaseMin = base.rr[0];
  const rrBaseMax = base.rr[1];

  let hr = randomInt(hrBaseMin, hrBaseMax);
  let temp = randomFloat(tempBaseMin, tempBaseMax, 1);
  let spo2 = randomInt(spo2BaseMin, spo2BaseMax);
  let rr = randomInt(rrBaseMin, rrBaseMax);

  if (context.stress === "alto") {
    hr += randomInt(6, 14);
    rr += randomInt(2, 5);
  } else if (context.stress === "bajo") {
    hr -= randomInt(2, 5);
  }

  if (context.flags?.cafe) hr += randomInt(5, 10);
  if (context.flags?.malaNoche) {
    temp += randomFloat(0.1, 0.4, 1);
    hr += randomInt(3, 8);
  }
  if (context.flags?.medicacion) {
    rr -= randomInt(1, 3);
  }

  if (scenario === "alert") {
    const choice = Math.random();
    if (choice < 0.34) {
      hr = Math.random() > 0.5 ? thresholds.hrMax + randomInt(8, 20) : thresholds.hrMin - randomInt(5, 12);
    } else if (choice < 0.67) {
      temp = Math.random() > 0.5
        ? thresholds.tempMax + randomFloat(0.6, 1.3, 1)
        : thresholds.tempMin - randomFloat(0.4, 1.0, 1);
    } else {
      spo2 = Math.max(85, thresholds.spo2Min - randomInt(4, 8));
    }
  }

  return {
    hr: clamp(hr, 30, 220),
    temp: Number(clamp(temp, 34, 41).toFixed(1)),
    spo2: clamp(spo2, 85, 100),
    rr: clamp(rr, 10, 30),
    context,
  };
}

export function generateRandomReading(thresholds, mode = "normal", context = {}) {
  return generateRandomVitals(thresholds, { scenario: mode, context });
}
