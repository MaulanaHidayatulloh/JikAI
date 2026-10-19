import { modes } from "./ModeCard";

function formatDate(date) {
  if (!date) return "Tanggal tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function ScenarioLibrary({
  scenarios = [],
  currentScenario,
  onSaveCurrent,
  onOpen,
  onDelete,
}) {
  const currentIsSaved = scenarios.some(
    (item) => item.id === currentScenario?.id,
  );

  return (
    <section className="scenario-library" id="arsip-simulasi">
      <div className="library-heading">
        <div>
          <span className="section-kicker">ARSIP PRIBADI</span>
          <h2>Semesta yang Kamu Simpan</h2>
          <p>
            Simpan dan jelajahi kembali kemungkinan yang pernah kamu ciptakan.
          </p>
        </div>

        <span className="library-count">{scenarios.length} simulasi</span>
      </div>

      {currentScenario && (
        <div className="library-save-panel">
          <div>
            <strong>Simpan simulasi saat ini</strong>
            <p>{currentScenario.title || "Simulasi tanpa judul"}</p>
          </div>

          <button
            type="button"
            className="button-primary"
            onClick={onSaveCurrent}
          >
            {currentIsSaved ? "Perbarui Arsip" : "Simpan Simulasi"}
          </button>
        </div>
      )}

      {scenarios.length === 0 ? (
        <div className="library-empty">
          <span className="library-empty-icon">✦</span>
          <h3>Arsipmu masih kosong</h3>
          <p>
            Buat simulasi menggunakan AI, lalu simpan di sini agar kamu bisa
            membukanya kembali kapan saja.
          </p>
        </div>
      ) : (
        <div className="library-grid">
          {scenarios.map((scenario) => {
            const mode = modes.find((item) => item.id === scenario.category);

            return (
              <article className="library-card" key={scenario.id}>
                <div className="library-card-top">
                  <span className="library-mode">
                    {mode?.title || "Simulasi JikAI"}
                  </span>

                  <button
                    type="button"
                    className="library-delete"
                    aria-label={`Hapus ${scenario.title}`}
                    title="Hapus simulasi"
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Hapus simulasi "${scenario.title}" dari arsip?`,
                      );

                      if (confirmed) onDelete(scenario.id);
                    }}
                  >
                    Hapus
                  </button>
                </div>

                <h3>{scenario.title || "Simulasi tanpa judul"}</h3>

                <p className="library-description">
                  {scenario.premise || scenario.prompt || ""}
                </p>

                <span className="library-date">
                  Disimpan {formatDate(scenario.savedAt)}
                </span>

                <button
                  type="button"
                  className="button-secondary library-open"
                  onClick={() => onOpen(scenario)}
                >
                  Buka Simulasi →
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
