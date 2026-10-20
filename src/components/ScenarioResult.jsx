import { useEffect, useState } from "react";
import {
  getSimulationProgress,
  saveSimulationProgress,
  getCachedImage,
  saveCachedImage,
} from "../services/storageService";
import {
  generateTimelineBranch,
  compareScenarioWorlds,
  generateScenarioImage,
} from "../services/simulationService";

const typeLabels = {
  established: "Fakta dasar",
  plausible: "Kemungkinan masuk akal",
  speculative: "Spekulatif",
};

function eventIdentity(event) {
  return (
    event?.id ?? `${event?.year ?? "tahun"}-${event?.title ?? "peristiwa"}`
  );
}

function TimelineEvent({ event, index, onExplore, isSelected }) {
  return (
    <article
      className={`timeline-event${isSelected ? " is-branch-origin" : ""}`}
    >
      <div className="timeline-event-marker">
        <span>{index + 1}</span>
      </div>
      <div className="timeline-event-content">
        <div className="timeline-event-meta">
          <span className="timeline-event-year">Tahun {event.year}</span>
          <span className={`timeline-event-type type-${event.type}`}>
            {typeLabels[event.type] ?? "Hipotetis"}
          </span>
        </div>
        <h4>{event.title}</h4>
        <p>{event.description}</p>
        <button
          type="button"
          className="timeline-branch-trigger"
          onClick={() => onExplore(event)}
          aria-expanded={isSelected}
        >
          <span aria-hidden="true">⑂</span>
          {isSelected
            ? "Tutup pilihan cabang"
            : "Bagaimana jika keputusannya berbeda?"}
        </button>
      </div>
    </article>
  );
}

function BranchTimeline({ branch }) {
  return (
    <section className="branch-result" aria-live="polite">
      <div className="branch-result-header">
        <span className="branch-result-icon" aria-hidden="true">
          ↗
        </span>
        <div>
          <span className="section-kicker">CABANG ALTERNATIF</span>
          <h4>{branch.title}</h4>
        </div>
      </div>
      <p className="branch-result-summary">{branch.summary}</p>
      <div className="branch-timeline">
        {branch.timeline.map((event, index) => (
          <article
            className="branch-event"
            key={event.id ?? `${event.year}-${index}`}
          >
            <span className="branch-event-index">{index + 1}</span>
            <div>
              <span className="timeline-event-year">Tahun {event.year}</span>
              <h5>{event.title}</h5>
              <p>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="branch-disclaimer">
        Cabang ini adalah salah satu kemungkinan hipotetis, bukan prediksi
        pasti.
      </p>
    </section>
  );
}

export default function ScenarioResult({ scenario }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [customChoice, setCustomChoice] = useState("");
  const [activeBranch, setActiveBranch] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState("");
  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");
  const [restoredScenarioId, setRestoredScenarioId] = useState(null);
  const [scenarioImage, setScenarioImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [timelineImage, setTimelineImage] = useState("");
  const [timelineImageLoading, setTimelineImageLoading] = useState(false);
  const [timelineImageError, setTimelineImageError] = useState("");
  const [branchImage, setBranchImage] = useState("");
  const [branchImageLoading, setBranchImageLoading] = useState(false);
  const [branchImageError, setBranchImageError] = useState("");

  // Pulihkan progres ketika skenario dibuka.
  useEffect(() => {
    if (!scenario?.id) return;

    const progress = getSimulationProgress(scenario.id);

    setSelectedEvent(progress?.selectedEvent ?? null);
    setActiveBranch(progress?.activeBranch ?? null);
    setComparison(progress?.comparison ?? null);

    setBranchError("");
    setComparisonError("");
    setBranchLoading(false);
    setComparisonLoading(false);

    setRestoredScenarioId(scenario.id);
  }, [scenario?.id]);

  // Simpan progres setiap kali pengguna membuat perubahan.
  useEffect(() => {
    if (!scenario?.id || restoredScenarioId !== scenario.id) return;

    saveSimulationProgress(scenario.id, {
      selectedEvent,
      activeBranch,
      comparison,
    });
  }, [
    scenario?.id,
    restoredScenarioId,
    selectedEvent,
    activeBranch,
    comparison,
  ]);

  // Membuat gambar untuk skenario.
  useEffect(() => {
    if (!scenario?.id) return;

    let cancelled = false;
    const cacheKey = `scenario:${scenario.id}`;

    async function loadScenarioImage() {
      setImageError("");
      setImageLoading(true);

      try {
        // Gunakan gambar tersimpan jika tersedia.
        const cachedImage = await getCachedImage(cacheKey);

        if (cancelled) return;

        if (cachedImage) {
          setScenarioImage(cachedImage);
          return;
        }

        // Buat gambar hanya jika belum ada di cache.
        const image = await generateScenarioImage(scenario);

        if (cancelled) return;

        await saveCachedImage(cacheKey, image);

        if (!cancelled) {
          setScenarioImage(image);
        }
      } catch (error) {
        if (!cancelled) {
          setImageError(error.message || "Gambar gagal dimuat.");
        }
      } finally {
        if (!cancelled) {
          setImageLoading(false);
        }
      }
    }

    setScenarioImage("");
    loadScenarioImage();

    return () => {
      cancelled = true;
    };
  }, [
    scenario?.id,
    scenario?.title,
    scenario?.premise,
    scenario?.pointOfDivergence,
  ]);

  // cache gambar timeline
  useEffect(() => {
    if (!scenario?.id || restoredScenarioId !== scenario.id || !selectedEvent) {
      setTimelineImage("");
      setTimelineImageError("");
      setTimelineImageLoading(false);
      return;
    }

    let cancelled = false;
    const cacheKey = `timeline:${scenario.id}:${eventIdentity(selectedEvent)}`;

    async function loadTimelineImage() {
      setTimelineImage("");
      setTimelineImageError("");
      setTimelineImageLoading(true);

      try {
        const cached = await getCachedImage(cacheKey);

        if (cancelled) return;

        if (cached) {
          setTimelineImage(cached);
          return;
        }

        const image = await generateScenarioImage({
          title: `${scenario.title}: ${selectedEvent.title}`,
          premise: selectedEvent.description,
          pointOfDivergence:
            `Tahun ${selectedEvent.year}. ` +
            "Visualisasi peristiwa penting dalam dunia alternatif.",
        });

        if (cancelled) return;

        await saveCachedImage(cacheKey, image);

        if (!cancelled) setTimelineImage(image);
      } catch (error) {
        if (!cancelled) {
          setTimelineImageError(
            error.message || "Visualisasi peristiwa gagal dibuat.",
          );
        }
      } finally {
        if (!cancelled) setTimelineImageLoading(false);
      }
    }

    loadTimelineImage();

    return () => {
      cancelled = true;
    };
  }, [scenario?.id, scenario?.title, restoredScenarioId, selectedEvent]);

  // cache gambar cabang alternatif
  useEffect(() => {
    if (!scenario?.id || restoredScenarioId !== scenario.id || !activeBranch) {
      setBranchImage("");
      setBranchImageError("");
      setBranchImageLoading(false);
      return;
    }

    let cancelled = false;

    const cacheKey = [
      "branch",
      scenario.id,
      eventIdentity(activeBranch.originEvent),
      activeBranch.choice,
      activeBranch.title,
    ].join(":");

    async function loadBranchImage() {
      setBranchImage("");
      setBranchImageError("");
      setBranchImageLoading(true);

      try {
        const cached = await getCachedImage(cacheKey);

        if (cancelled) return;

        if (cached) {
          setBranchImage(cached);
          return;
        }

        const image = await generateScenarioImage({
          title: activeBranch.title,
          premise: activeBranch.summary,
          pointOfDivergence:
            `Cabang dari skenario "${scenario.title}". ` +
            `Pilihan: ${activeBranch.choice}.`,
        });

        if (cancelled) return;

        await saveCachedImage(cacheKey, image);

        if (!cancelled) setBranchImage(image);
      } catch (error) {
        if (!cancelled) {
          setBranchImageError(
            error.message || "Visualisasi cabang alternatif gagal dibuat.",
          );
        }
      } finally {
        if (!cancelled) setBranchImageLoading(false);
      }
    }

    loadBranchImage();

    return () => {
      cancelled = true;
    };
  }, [scenario?.id, scenario?.title, restoredScenarioId, activeBranch]);

  if (!scenario) return null;

  const assumptions = Array.isArray(scenario.assumptions)
    ? scenario.assumptions
    : [];
  const timeline = Array.isArray(scenario.timeline) ? scenario.timeline : [];

  function toggleEvent(event) {
    setSelectedEvent((current) =>
      current && eventIdentity(current) === eventIdentity(event) ? null : event,
    );
    setCustomChoice("");
    setBranchError("");
  }

  async function chooseBranch(choice) {
    if (!selectedEvent || branchLoading) return;
    setBranchLoading(true);
    setBranchError("");
    setActiveBranch(null);
    setComparison(null);
    setComparisonError("");
    try {
      const branch = await generateTimelineBranch({
        scenario,
        event: selectedEvent,
        choice,
      });
      setActiveBranch({ ...branch, originEvent: selectedEvent, choice });
      setSelectedEvent(null);
    } catch (error) {
      setBranchError(
        error.message || "Cabang alternatif gagal dibuat. Coba lagi.",
      );
    } finally {
      setBranchLoading(false);
    }
  }

  async function handleCompareWorlds() {
    if (!activeBranch || comparisonLoading) return;
    setComparisonLoading(true);
    setComparisonError("");
    setComparison(null);
    try {
      const result = await compareScenarioWorlds({
        scenario,
        branch: activeBranch,
      });
      setComparison(result);
    } catch (error) {
      setComparisonError(
        error.message || "Perbandingan dunia gagal dibuat. Coba lagi.",
      );
    } finally {
      setComparisonLoading(false);
    }
  }

  return (
    <section className="scenario-result" aria-live="polite">
      <div className="scenario-result-header">
        <span className="section-kicker">HASIL SIMULASI AI</span>
        <span className="scenario-result-badge">Skenario berhasil dibuat</span>
      </div>

      <h2 className="scenario-result-title">{scenario.title}</h2>
      <p className="scenario-result-premise">{scenario.premise}</p>

      <div className="scenario-visual">
        {imageLoading && (
          <div className="scenario-visual-placeholder" role="status">
            <span className="scenario-loading-spinner" />
            <p>JikAI sedang menggambarkan dunia alternatifmu...</p>
          </div>
        )}

        {scenarioImage && (
          <figure className="scenario-visual-figure">
            <img
              src={scenarioImage}
              alt={`Visualisasi dunia alternatif: ${scenario.title}`}
            />
            <figcaption>*Gambar dibuat otomatis oleh JikAI</figcaption>
          </figure>
        )}

        {imageError && (
          <p className="scenario-visual-error" role="status">
            {imageError}
          </p>
        )}
      </div>

      <div className="scenario-result-block">
        <span className="scenario-result-label">TITIK PERUBAHAN</span>
        <p>{scenario.pointOfDivergence}</p>
      </div>

      {assumptions.length > 0 && (
        <div className="scenario-result-block">
          <span className="scenario-result-label">ASUMSI DUNIA INI</span>
          <ul className="scenario-assumptions">
            {assumptions.map((assumption, index) => (
              <li key={`${index}-${assumption}`}>{assumption}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="scenario-timeline-heading">
        <div>
          <span className="section-kicker">GARIS WAKTU INTERAKTIF</span>
          <h3>Bagaimana dunia berkembang?</h3>
          <p className="timeline-helper">
            Pilih salah satu peristiwa untuk menjelajahi keputusan alternatif
            dan melihat dampaknya.
          </p>
        </div>
        <span className="timeline-count">{timeline.length} peristiwa</span>
      </div>

      <div className="scenario-timeline">
        {timeline.map((event, index) => (
          <div
            className="timeline-event-wrap"
            key={event.id ?? `${event.year}-${index}`}
          >
            <TimelineEvent
              event={event}
              index={index}
              onExplore={toggleEvent}
              isSelected={
                selectedEvent &&
                eventIdentity(selectedEvent) === eventIdentity(event)
              }
            />
            {selectedEvent &&
              eventIdentity(selectedEvent) === eventIdentity(event) && (
                <div className="branch-choice-panel">
                  <span className="scenario-result-label">
                    TENTUKAN KEPUTUSANMU
                  </span>
                  <p>
                    Tulis keputusan alternatifmu sendiri. JikAI akan
                    menyimulasikan bagaimana dunia berkembang jika keputusan itu
                    diambil.
                  </p>
                  <label
                    className="branch-custom-choice-label"
                    htmlFor={`branch-choice-${eventIdentity(selectedEvent)}`}
                  >
                    Keputusan alternatif
                  </label>
                  <textarea
                    id={`branch-choice-${eventIdentity(selectedEvent)}`}
                    className="branch-custom-choice-input"
                    value={customChoice}
                    onChange={(event) => setCustomChoice(event.target.value)}
                    placeholder="Contoh: Pemerintah memilih bekerja sama dengan negara tetangga untuk mengembangkan teknologi energi bersih..."
                    maxLength={240}
                    rows={3}
                    disabled={branchLoading}
                  />
                  <div className="branch-custom-choice-footer">
                    <span className="branch-custom-choice-hint">
                      Jelaskan tindakan atau keputusan yang ingin kamu ambil.
                    </span>
                    <span
                      className={
                        customChoice.length >= 220 ? "is-near-limit" : ""
                      }
                    >
                      {customChoice.length}/240
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button-primary branch-custom-choice-submit"
                    onClick={() => chooseBranch(customChoice.trim())}
                    disabled={branchLoading || !customChoice.trim()}
                  >
                    {branchLoading
                      ? "Menyimulasikan..."
                      : "Simulasikan keputusan ↗"}
                  </button>
                  {branchLoading && (
                    <div className="branch-loading" role="status">
                      <span className="scenario-loading-spinner" />
                      <span>
                        JikAI sedang merangkai konsekuensi pilihanmu...
                      </span>
                    </div>
                  )}
                  {branchError && (
                    <p className="branch-error" role="alert">
                      {branchError}
                    </p>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>

      {activeBranch && (
        <div className="branch-outcome-wrap">
          <div className="branch-origin-note">
            <span>Cabang dimulai dari</span>
            <strong>
              Tahun {activeBranch.originEvent.year} ·{" "}
              {activeBranch.originEvent.title}
            </strong>
            <span>Keputusan: {activeBranch.choice}</span>
          </div>

          <div className="scenario-visual">
            {branchImageLoading && (
              <div className="scenario-visual-placeholder" role="status">
                <span className="scenario-loading-spinner" />
                <p>JikAI sedang menggambarkan dunia hasil pilihanmu...</p>
              </div>
            )}

            {branchImage && (
              <figure className="scenario-visual-figure">
                <img
                  src={branchImage}
                  alt={`Visualisasi dunia alternatif: ${activeBranch.title}`}
                />
                <figcaption>*Gambar dibuat otomatis oleh JikAI</figcaption>
              </figure>
            )}

            {branchImageError && (
              <p className="scenario-visual-error" role="status">
                {branchImageError}
              </p>
            )}
          </div>

          <BranchTimeline branch={activeBranch} />

          <div className="world-comparison-actions">
            <button
              type="button"
              className="world-compare-button"
              onClick={handleCompareWorlds}
              disabled={comparisonLoading}
            >
              <span aria-hidden="true">⇄</span>
              {comparisonLoading
                ? "Membandingkan dunia..."
                : comparison
                  ? "Perbarui perbandingan"
                  : "Bandingkan kedua dunia"}
            </button>
            <button
              type="button"
              className="branch-reset-button"
              onClick={() => {
                setActiveBranch(null);
                setSelectedEvent(null);
                setBranchError("");
                setComparison(null);
                setComparisonError("");
              }}
            >
              Jelajahi cabang lain
            </button>
          </div>
          {comparisonLoading && (
            <div className="world-compare-loading" role="status">
              <span className="scenario-loading-spinner" />
              <span>JikAI sedang menganalisis perbedaan kedua dunia...</span>
            </div>
          )}
          {comparisonError && (
            <p className="branch-error" role="alert">
              {comparisonError}
            </p>
          )}
          {comparison && (
            <section className="world-comparison" aria-live="polite">
              <div className="world-comparison-heading">
                <span className="section-kicker">ANALISIS PERBANDINGAN AI</span>
                <h4>Dua dunia, dua kemungkinan</h4>
                <p>{comparison.summary}</p>
              </div>
              <div className="world-comparison-table">
                <div className="world-comparison-row world-comparison-header">
                  <span>Aspek</span>
                  <span>Dunia awal</span>
                  <span>Dunia alternatif</span>
                </div>
                {comparison.dimensions.map((dimension, index) => (
                  <div
                    className="world-comparison-row"
                    key={`${dimension.label}-${index}`}
                  >
                    <strong>{dimension.label}</strong>
                    <p>{dimension.original}</p>
                    <p>{dimension.alternative}</p>
                  </div>
                ))}
              </div>
              <div className="world-comparison-insights">
                <div>
                  <span className="scenario-result-label">
                    PERBEDAAN PALING MENENTUKAN
                  </span>
                  <p>{comparison.keyDifference}</p>
                </div>
                <div>
                  <span className="scenario-result-label">
                    HAL YANG BELUM PASTI
                  </span>
                  <p>{comparison.uncertainty}</p>
                </div>
              </div>
              <p className="branch-disclaimer">
                Perbandingan ini merupakan analisis atas simulasi hipotetis,
                bukan prediksi pasti.
              </p>
            </section>
          )}
        </div>
      )}

      <p className="scenario-result-disclaimer">
        {scenario.disclaimer ||
          "Skenario ini bersifat hipotetis dan bukan prediksi masa depan."}
      </p>
    </section>
  );
}
