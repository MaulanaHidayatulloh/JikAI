import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`JikAI backend berjalan di http://localhost:${PORT}`);
  console.log(
    `Groq API key: ${
      process.env.GROQ_API_KEY ? "terdeteksi" : "belum dikonfigurasi"
    }`,
  );
});
