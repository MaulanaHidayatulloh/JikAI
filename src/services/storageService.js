const STORAGE_KEY = "jikai_saved_scenarios_v1";
const PROGRESS_KEY = "jikai_simulation_progress_v1";
const IMAGE_DB_NAME = "jikai_image_cache";
const IMAGE_STORE_NAME = "images";

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

  // Hapus progres simulasi yang terkait dengan skenario ini.
  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");

    delete allProgress[id];

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Gagal menghapus progres simulasi:", error);
  }

  return updatedScenarios;
}

export function getSimulationProgress(scenarioId) {
  if (!scenarioId) return null;

  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");

    return allProgress[scenarioId] || null;
  } catch (error) {
    console.error("Gagal membaca progres simulasi:", error);
    return null;
  }
}

export function saveSimulationProgress(scenarioId, progress) {
  if (!scenarioId) return;

  try {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");

    allProgress[scenarioId] = {
      ...progress,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Gagal menyimpan progres simulasi:", error);
  }
}

function openImageDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedImage(key) {
  const db = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, "readonly");
    const request = transaction.objectStore(IMAGE_STORE_NAME).get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

export async function saveCachedImage(key, imageDataUrl) {
  const db = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE_NAME, "readwrite");

    transaction.objectStore(IMAGE_STORE_NAME).put(imageDataUrl, key);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
