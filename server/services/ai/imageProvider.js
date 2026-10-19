export async function generateScenarioImage(prompt) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Konfigurasi Cloudflare Workers AI belum lengkap.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
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
