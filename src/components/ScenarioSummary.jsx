import { modes } from "./ModeCard";

export default function ScenarioSummary({ scenario, onReset }) {
  if (!scenario) return null;

  const mode = modes.find((item) => item.id === scenario.category);

  const detailLabels = {
    concise: "Ringkas",
    standard: "Seimbang",
    detailed: "Mendalam",
  };

  return (
    <section className="scenario-summary" aria-live="polite">
      <div className="summary-topline">
        <span className="summary-check">✓</span>
        <span className="section-kicker">KONFIGURASI SIAP</span>
      </div>

      <h3>{scenario.prompt}</h3>

      <p className="summary-description">
        Berikut pengaturan simulasi yang akan digunakan untuk membangun dunia
        alternatifmu.
      </p>

      <div className="summary-details">
        <div>
          <span>Mode simulasi</span>
          <strong>{mode?.title ?? scenario.category}</strong>
        </div>

        <div>
          <span>Tahun awal</span>
          <strong>{scenario.startYear}</strong>
        </div>

        <div>
          <span>Peristiwa awal</span>
          <strong>{scenario.timelineLength} peristiwa</strong>
        </div>

        <div>
          <span>Tingkat detail</span>
          <strong>{detailLabels[scenario.detailLevel]}</strong>
        </div>
      </div>

      <div className="summary-notice">
        <span aria-hidden="true">✳</span>
        Konfigurasi tersimpan sementara di tampilan ini. Belum ada permintaan AI
        yang dikirim.
      </div>

      <button type="button" className="button-secondary" onClick={onReset}>
        Ubah Konfigurasi
      </button>
    </section>
  );
}
