import { modes } from "./ModeCard";

export default function ScenarioForm({
  selectedMode,
  question,
  setQuestion,
  onSubmit,
  isGenerating = false,
}) {
  return (
    <form
      className="scenario-form"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        onSubmit({
          category: selectedMode,
          prompt: question.trim(),
          startYear: Number(formData.get("startYear")),
          timelineLength: Number(formData.get("timelineLength")),
          detailLevel: formData.get("detailLevel"),
        });
      }}
    >
      <div className="scenario-form-heading">
        <span className="section-kicker">RANCANG DUNIAMU</span>
        <h3>Mulai dari sebuah pertanyaan</h3>
        <p>
          Tentukan kemungkinan yang ingin kamu jelajahi dan atur bagaimana
          simulasi akan disusun.
        </p>
      </div>

      <label htmlFor="question-input">Pertanyaan atau ide skenario</label>

      <div className="question-box">
        <span className="question-sparkle" aria-hidden="true">
          ✳
        </span>

        <input
          id="question-input"
          name="prompt"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Contoh: Bagaimana jika manusia tinggal di Mars?"
          maxLength={500}
          required
        />
      </div>

      <div className="scenario-fields">
        <div className="scenario-field">
          <label htmlFor="start-year">Tahun awal skenario</label>
          <input
            id="start-year"
            name="startYear"
            type="number"
            defaultValue={2026}
            min={-3000}
            max={3000}
            required
          />
          <span className="field-help">
            Gunakan tahun yang sesuai dengan idemu.
          </span>
        </div>

        <div className="scenario-field">
          <label htmlFor="timeline-length">Jumlah peristiwa awal</label>
          <select id="timeline-length" name="timelineLength" defaultValue="6">
            <option value="5">5 peristiwa</option>
            <option value="6">6 peristiwa</option>
            <option value="7">7 peristiwa</option>
          </select>
          <span className="field-help">Menentukan panjang kronologi awal.</span>
        </div>

        <div className="scenario-field">
          <label htmlFor="detail-level">Tingkat detail</label>
          <select id="detail-level" name="detailLevel" defaultValue="standard">
            <option value="concise">Ringkas</option>
            <option value="standard">Seimbang</option>
            <option value="detailed">Mendalam</option>
          </select>
          <span className="field-help">Menentukan kedalaman penjelasan.</span>
        </div>
      </div>

      <div className="scenario-selected-mode">
        <span className="status-dot" />
        Mode aktif:{" "}
        <strong>{modes.find((mode) => mode.id === selectedMode)?.title}</strong>
      </div>

      <button
        className="button-primary scenario-submit"
        type="submit"
        disabled={isGenerating}
      >
        {isGenerating ? "Sedang Menyusun..." : "Buat Skenario dengan AI"}
        {!isGenerating && <span aria-hidden="true"> →</span>}
      </button>

      <p className="scenario-disclaimer">
        Untuk saat ini, formulir akan menyiapkan ringkasan konfigurasi.
        Generator AI akan ditambahkan pada tahap berikutnya.
      </p>
    </form>
  );
}
