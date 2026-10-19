const modes = [
  {
    id: "alternate_history",
    icon: "◷",
    title: "Sejarah Alternatif",
    description:
      "Jelajahi bagaimana dunia berubah jika sejarah berjalan berbeda.",
    example: "Bagaimana jika internet ditemukan 50 tahun lebih awal?",
    color: "lavender",
  },
  {
    id: "future_simulator",
    icon: "↗",
    title: "Simulasi Masa Depan",
    description:
      "Telusuri berbagai kemungkinan masa depan berdasarkan perubahan hari ini.",
    example: "Bagaimana jika semua kendaraan menggunakan energi bersih?",
    color: "blue",
  },
  {
    id: "decision_simulator",
    icon: "⑂",
    title: "Simulasi Keputusan",
    description:
      "Bandingkan konsekuensi dari pilihan dan keputusan yang berbeda.",
    example: "Bagaimana jika sebuah kota menggratiskan transportasi umum?",
    color: "peach",
  },
  {
    id: "fictional_worlds",
    icon: "✳",
    title: "Dunia Imajinasi",
    description:
      "Bangun dunia fiksi dengan aturan, peradaban, dan kemungkinan unik.",
    example: "Bagaimana jika manusia dapat hidup di bawah laut?",
    color: "mint",
  },
];

export { modes };

export default function ModeCard({ mode, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`mode-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(mode.id)}
      aria-pressed={selected}
    >
      <span className={`mode-icon ${mode.color}`}>{mode.icon}</span>

      <span className="mode-title">{mode.title}</span>
      <span className="mode-description">{mode.description}</span>

      <span className="mode-example">
        <span className="example-label">CONTOH</span>
        {mode.example}
      </span>

      <span className="mode-footer">
        {selected ? "Mode dipilih ✓" : "Pilih mode"}
        <span aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
