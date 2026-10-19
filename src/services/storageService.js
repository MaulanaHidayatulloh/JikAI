const STORAGE_KEY = "jikai_saved_scenarios_v1";

export function getSavedScenarios() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const scenarios = JSON.parse(stored);

    return Array.isArray(scenarios) ? scenarios : [];
  } catch (error) {
    console.error("Gagal membaca arsip JikAI:", error);
    return [];
  }
}

export function saveScenarioToStorage(scenario) {
  if (!scenario || !scenario.id) {
    throw new Error("Data simulasi tidak valid untuk disimpan.");
  }

  const scenarios = getSavedScenarios();
  const existingIndex = scenarios.findIndex((item) => item.id === scenario.id);

  const existing = existingIndex >= 0 ? scenarios[existingIndex] : null;

  const savedScenario = {
    ...scenario,
    savedAt: existing?.savedAt || new Date().toISOString(),
  };

  const updatedScenarios =
    existingIndex >= 0
      ? scenarios.map((item) =>
          item.id === scenario.id ? savedScenario : item,
        )
      : [savedScenario, ...scenarios];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));

  return updatedScenarios;
}

export function deleteScenarioFromStorage(id) {
  const updatedScenarios = getSavedScenarios().filter(
    (scenario) => scenario.id !== id,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));

  return updatedScenarios;
}
