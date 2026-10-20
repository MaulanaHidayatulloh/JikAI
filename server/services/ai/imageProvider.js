const CINEMATIC_STYLE = `
Photorealistic live-action cinematic film still.
Realistic alternate-history world captured as a frame
from a high-budget historical drama film.
Authentic real-world architecture and environments.
Natural human anatomy, realistic skin texture,
detailed fabric, stone, concrete, metal and wood.
Physically accurate lighting, natural shadows,
cinematic depth of field, atmospheric perspective,
professional film composition, subtle film grain,
natural cinematic color grading, realistic photography.

Strictly live-action photorealism.
No cartoon, no anime, no illustration, no painting,
no comic-book style, no toy-like objects,
no plastic skin, no exaggerated proportions,
no artificial 3D animation appearance,
no oversaturated colors, no text, no watermark.
`
  .replace(/\s+/g, " ")
  .trim();

export async function generateScenarioImage(prompt) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Konfigurasi Cloudflare Workers AI belum lengkap.");
  }

  const scenarioPrompt = typeof prompt === "string" ? prompt.trim() : "";

  if (!scenarioPrompt) {
    throw new Error("Deskripsi gambar tidak boleh kosong.");
  }

  const finalPrompt = [
    CINEMATIC_STYLE,
    "Scene description:",
    scenarioPrompt.slice(0, 1200),
  ].join("\n");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        steps: 4,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success || !data.result?.image) {
    console.error("Cloudflare image error:", data.errors);
    throw new Error("Gambar gagal dibuat. Silakan coba lagi.");
  }

  return `data:image/jpeg;base64,${data.result.image}`;
}
