const validModes = [
  "alternate_history",
  "future_simulator",
  "decision_simulator",
  "fictional_worlds",
];

const validDetails = ["concise", "standard", "detailed"];

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function validateScenarioRequest(body = {}) {
  const { category, prompt, startYear, timelineLength, detailLevel } = body;

  if (!validModes.includes(category)) {
    throw validationError("Mode simulasi tidak valid.");
  }

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.trim().length > 500
  ) {
    throw validationError("Pertanyaan wajib diisi dan maksimal 500 karakter.");
  }

  const year = Number(startYear);
  const eventCount = Number(timelineLength);

  if (!Number.isInteger(year) || year < -3000 || year > 3000) {
    throw validationError(
      "Tahun awal harus berupa bilangan bulat antara -3000 dan 3000.",
    );
  }

  if (![5, 6, 7].includes(eventCount)) {
    throw validationError("Jumlah peristiwa harus 5, 6, atau 7.");
  }

  return {
    category,
    prompt: prompt.trim(),
    startYear: year,
    timelineLength: eventCount,
    detailLevel: validDetails.includes(detailLevel) ? detailLevel : "standard",
  };
}

export function validateGeneratedScenario(scenario, eventCount) {
  const validTypes = ["established", "plausible", "speculative"];

  if (
    !scenario ||
    typeof scenario.title !== "string" ||
    typeof scenario.premise !== "string" ||
    typeof scenario.pointOfDivergence !== "string" ||
    !Array.isArray(scenario.assumptions) ||
    !Array.isArray(scenario.timeline) ||
    scenario.timeline.length !== eventCount
  ) {
    return false;
  }

  return scenario.timeline.every(
    (event) =>
      event &&
      typeof event.title === "string" &&
      typeof event.description === "string" &&
      Number.isInteger(event.year) &&
      validTypes.includes(event.type),
  );
}
