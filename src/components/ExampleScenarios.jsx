const examples = [
  {
    category: "SEJARAH ALTERNATIF",
    title: "Bagaimana jika Indonesia merdeka pada 1920?",
    description: "Jelajahi perubahan politik, ekonomi, dan masyarakat.",
    icon: "◷",
  },
  {
    category: "SIMULASI MASA DEPAN",
    title: "Bagaimana jika AI mengubah seluruh dunia kerja?",
    description: "Telusuri peluang, tantangan, dan dampaknya.",
    icon: "↗",
  },
  {
    category: "DUNIA IMAJINASI",
    title: "Bagaimana jika manusia hidup di dua planet?",
    description: "Bayangkan peradaban dan hubungan antardunia.",
    icon: "✳",
  },
];

export default function ExampleScenarios({ onChoose }) {
  return (
    <section className="examples-section" id="contoh">
      <div className="section-heading">
        <div>
          <span className="section-kicker">MULAI DARI RASA INGIN TAHU</span>
          <h2>Bagaimana jika...?</h2>
          <p>Beberapa ide untuk membuka kemungkinan baru.</p>
        </div>
      </div>

      <div className="examples-grid">
        {examples.map((item) => (
          <button
            type="button"
            className="example-card"
            key={item.title}
            onClick={() => onChoose(item.title)}
          >
            <span className="example-card-icon">{item.icon}</span>
            <span className="example-category">{item.category}</span>
            <span className="example-title">{item.title}</span>
            <span className="example-description">{item.description}</span>
            <span className="example-link">
              Gunakan ide ini <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
