export default function ScenarioResult({ scenario }) {
  if (!scenario) return null;

  const assumptions = Array.isArray(scenario.assumptions)
    ? scenario.assumptions
    : [];

  const timeline = Array.isArray(scenario.timeline) ? scenario.timeline : [];

  const typeLabels = {
    established: "Fakta dasar",
    plausible: "Kemungkinan masuk akal",
    speculative: "Spekulatif",
  };

  return (
    <section className="scenario-result" aria-live="polite">
      <div className="scenario-result-header">
        <span className="section-kicker">HASIL SIMULASI AI</span>
        <span className="scenario-result-badge">Skenario berhasil dibuat</span>
      </div>

      <h2 className="scenario-result-title">{scenario.title}</h2>

      <p className="scenario-result-premise">{scenario.premise}</p>

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
          <span className="section-kicker">GARIS WAKTU</span>
          <h3>Bagaimana dunia berkembang?</h3>
        </div>

        <span className="timeline-count">{timeline.length} peristiwa</span>
      </div>

      <div className="scenario-timeline">
        {timeline.map((event, index) => (
          <article
            className="timeline-event"
            key={event.id ?? `${event.year}-${index}`}
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
            </div>
          </article>
        ))}
      </div>

      <p className="scenario-result-disclaimer">
        {scenario.disclaimer ||
          "Skenario ini bersifat hipotetis dan bukan prediksi masa depan."}
      </p>
    </section>
  );
}
