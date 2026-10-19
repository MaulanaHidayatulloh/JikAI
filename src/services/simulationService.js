import { apiRequest } from "./apiClient";

export async function generateScenario(configuration) {
  const result = await apiRequest("/api/generate-scenario", {
    method: "POST",
    body: JSON.stringify(configuration),
  });

  if (!result.scenario) {
    throw new Error("Respons backend tidak berisi data skenario.");
  }

  return result.scenario;
}
