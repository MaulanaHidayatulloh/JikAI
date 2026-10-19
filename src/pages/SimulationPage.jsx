import ModeCard, { modes } from "../components/ModeCard";
import ScenarioForm from "../components/ScenarioForm";
import ScenarioSummary from "../components/ScenarioSummary";
import ScenarioResult from "../components/ScenarioResult";

export default function SimulationPage({
  selectedMode,
  onModeSelect,
  question,
  setQuestion,
  onGenerate,
  isGenerating,
  errorMessage,
  onClearError,
  scenarioDraft,
  onReset,
  generatedScenario,
  onSaveCurrent,
}) {
  return (
    <main className="simulation-page">
      <section className="modes-section" id="mode">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RUANG SIMULASI</span>
            <h1>Ciptakan dunia alternatifmu</h1>
            <p>
              Pilih mode, tentukan titik awal, lalu biarkan JikAI menyusun
              kemungkinan yang bisa kamu jelajahi.
            </p>
          </div>

          <span className="mode-count">04 MODE TERSEDIA</span>
        </div>

        <div className="modes-grid">
          {modes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              selected={selectedMode === mode.id}
              onSelect={onModeSelect}
            />
          ))}
        </div>

        <ScenarioForm
          selectedMode={selectedMode}
          question={question}
          setQuestion={setQuestion}
          onSubmit={onGenerate}
          isGenerating={isGenerating}
        />

        {isGenerating && (
          <div className="scenario-loading" role="status">
            <span className="scenario-loading-spinner" />
            <div>
              <strong>JikAI sedang membangun duniamu...</strong>
              <p>AI sedang menyusun premis dan rangkaian peristiwa.</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="scenario-error" role="alert">
            <strong>Skenario belum berhasil dibuat</strong>
            <p>{errorMessage}</p>
            <button
              type="button"
              className="button-secondary"
              onClick={onClearError}
            >
              Tutup pesan
            </button>
          </div>
        )}

        <ScenarioSummary scenario={scenarioDraft} onReset={onReset} />
      </section>

      {generatedScenario && (
        <div id="scenario-result" className="scenario-result-anchor">
          <div className="scenario-result-actions">
            <button
              type="button"
              className="button-primary"
              onClick={onSaveCurrent}
            >
              Simpan ke Arsip
            </button>
          </div>

          <ScenarioResult scenario={generatedScenario} />
        </div>
      )}
    </main>
  );
}
