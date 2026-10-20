import { useEffect, useState } from "react";
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
  isScenarioSaved = false,
}) {
  const [saveFeedback, setSaveFeedback] = useState({
    scenarioId: null,
    animated: false,
    notice: "",
  });
  const saveAnimation =
    saveFeedback.scenarioId === generatedScenario?.id && saveFeedback.animated;
  const saveNotice =
    saveFeedback.scenarioId === generatedScenario?.id
      ? saveFeedback.notice
      : "";

  useEffect(() => {
    if (!saveNotice) return undefined;

    const scenarioId = generatedScenario?.id;
    const timeoutId = window.setTimeout(() => {
      setSaveFeedback((current) =>
        current.scenarioId === scenarioId
          ? { ...current, notice: "" }
          : current,
      );
    }, 2800);
    return () => window.clearTimeout(timeoutId);
  }, [saveNotice, generatedScenario?.id]);

  function handleSaveClick() {
    const saved = onSaveCurrent?.();
    if (!saved) return;

    setSaveFeedback({
      scenarioId: generatedScenario?.id,
      animated: true,
      notice: isScenarioSaved
        ? "Skenario ini sudah tersimpan di arsip."
        : "Skenario berhasil disimpan ke arsip!",
    });
  }

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
              className={`button-primary archive-save-button${saveAnimation ? " is-saved" : ""}`}
              onClick={handleSaveClick}
              aria-label={
                isScenarioSaved || saveAnimation
                  ? "Skenario tersimpan di arsip"
                  : "Simpan skenario ke arsip"
              }
            >
              <span className="archive-save-icon" aria-hidden="true">
                {isScenarioSaved || saveAnimation ? (
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="m4.5 10.2 3.5 3.4 7.5-7.3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 3.5h10a1 1 0 0 1 1 1v12l-6-3.5-6 3.5v-12a1 1 0 0 1 1-1Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span>
                {isScenarioSaved || saveAnimation
                  ? "Tersimpan di Arsip"
                  : "Simpan ke Arsip"}
              </span>
            </button>
          </div>
          {saveNotice && (
            <div className="archive-save-toast" role="status" key={saveNotice}>
              <span className="archive-save-toast-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    d="m4.5 10.2 3.5 3.4 7.5-7.3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{saveNotice}</span>
            </div>
          )}

          <ScenarioResult scenario={generatedScenario} />
        </div>
      )}
    </main>
  );
}
