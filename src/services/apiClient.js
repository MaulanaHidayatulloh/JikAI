const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Backend tidak dapat dihubungi. Pastikan server JikAI sedang berjalan.",
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Backend mengembalikan respons yang tidak valid.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Permintaan gagal dengan status ${response.status}.`,
    );
  }

  return result;
}
