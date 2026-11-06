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
  continueWorldTimeline,
} from "../services/simulationService";

const WORLD_METRICS = [
  {
    key: "economy",
    label: "Ekonomi",
    positive: [
      "ekonomi tumbuh",
      "pertumbuhan",
      "investasi",
      "lapangan kerja",
      "kemakmuran",
      "produktivitas",
      "perdagangan meningkat",
      "industri berkembang",
      "pendapatan naik",
    ],
    negative: [
      "resesi",
      "krisis ekonomi",
      "pengangguran",
      "kemiskinan",
      "inflasi",
      "utang meningkat",
      "perdagangan menurun",
      "industri runtuh",
      "pendapatan turun",
    ],
  },
  {
    key: "technology",
    label: "Teknologi",
    positive: [
      "teknologi",
      "inovasi",
      "riset",
      "penelitian",
      "digitalisasi",
      "otomatisasi",
      "penemuan",
      "infrastruktur digital",
      "kecerdasan buatan",
    ],
    negative: [
      "kegagalan teknologi",
      "serangan siber",
      "kebocoran data",
      "teknologi tertinggal",
      "riset terhenti",
      "infrastruktur rusak",
    ],
  },
  {
    key: "stability",
    label: "Stabilitas",
    positive: [
      "stabilitas",
      "perdamaian",
      "gencatan senjata",
      "kerja sama",
      "diplomasi berhasil",
      "konflik berakhir",
      "rekonsiliasi",
      "keamanan meningkat",
    ],
    negative: [
      "perang",
      "konflik",
      "kerusuhan",
      "kudeta",
      "krisis politik",
      "ketegangan",
      "serangan",
      "instabilitas",
      "sanksi",
    ],
  },
  {
    key: "wellbeing",
    label: "Kesejahteraan",
    positive: [
      "kesejahteraan",
      "layanan kesehatan",
      "pendidikan meningkat",
      "akses pendidikan",
      "kualitas hidup",
      "layanan publik",
      "harapan hidup",
      "kemiskinan menurun",
    ],
    negative: [
      "kelaparan",
      "wabah",
      "krisis kesehatan",
      "layanan publik memburuk",
      "kesenjangan",
      "kemiskinan meningkat",
      "pengungsian",
      "akses kesehatan menurun",
    ],
  },
  {
    key: "environment",
    label: "Lingkungan",
    positive: [
      "energi terbarukan",
      "energi bersih",
      "konservasi",
      "reboisasi",
      "emisi menurun",
      "polusi menurun",
      "perlindungan hutan",
      "keanekaragaman hayati",
    ],
    negative: [
      "deforestasi",
      "polusi",
      "emisi meningkat",
      "perubahan iklim",
      "bencana ekologis",
      "pencemaran",
      "kerusakan hutan",
      "kepunahan",
    ],
  },
];

function calculateWorldMetrics(worldTimeline = [], contextText = "") {
  const fullText =
    `${contextText} ${(worldTimeline || []).map((event) => `${event.title || ""} ${event.description || ""}`).join(" ")}`.toLocaleLowerCase(
      "id-ID",
    );
  return WORLD_METRICS.map((metric) => {
    const positiveHits = metric.positive.reduce(
      (total, term) => total + (fullText.includes(term) ? 1 : 0),
      0,
    );
    const negativeHits = metric.negative.reduce(
      (total, term) => total + (fullText.includes(term) ? 1 : 0),
      0,
    );
    const score = Math.max(
      10,
      Math.min(90, 50 + (positiveHits - negativeHits) * 7),
    );
    return { ...metric, score, delta: (positiveHits - negativeHits) * 7 };
  });
}

function WorldMetricsPanel({ scenario, originalTimeline, activeBranch }) {
  const originalMetrics = calculateWorldMetrics(
    originalTimeline,
    `${scenario.title || ""} ${scenario.premise || ""} ${scenario.prompt || ""}`,
  );
  const currentTimeline = activeBranch?.timeline || originalTimeline;
  const currentContext = `${scenario.title || ""} ${scenario.premise || ""} ${scenario.prompt || ""} ${activeBranch ? `${activeBranch.title || ""} ${activeBranch.summary || ""} ${activeBranch.choice || ""}` : ""}`;
  const currentMetrics = activeBranch
    ? calculateWorldMetrics(currentTimeline, currentContext)
    : originalMetrics;

  return (
    <section
      className="world-metrics-panel"
      aria-label="Statistik dan analisis dunia"
    >
      <div className="world-metrics-heading">
        <div>
          <span className="section-kicker">STATISTIK DAN ANALISIS DUNIA</span>
          <h3>
            {activeBranch
              ? `Kondisi: ${activeBranch.title}`
              : "Indikator perkembangan dunia"}
          </h3>
          <p>
            Skor ilustratif yang membantu membaca arah skenario, bukan statistik
            dunia nyata.
          </p>
        </div>
        <span className="world-metrics-badge">Skala 10–90</span>
      </div>
      <div className="world-metrics-grid">
        {currentMetrics.map((metric) => {
          const original = originalMetrics.find(
            (item) => item.key === metric.key,
          );
          const difference = metric.score - original.score;
          return (
            <article className="world-metric-card" key={metric.key}>
              <div className="world-metric-card-top">
                <strong>{metric.label}</strong>
                <span className="world-metric-score">{metric.score}</span>
              </div>
              <div
                className="world-metric-track"
                role="progressbar"
                aria-label={metric.label}
                aria-valuemin={10}
                aria-valuemax={90}
                aria-valuenow={metric.score}
              >
                <span
                  style={{ width: `${((metric.score - 10) / 80) * 100}%` }}
                />
              </div>
              <div className="world-metric-card-bottom">
                <span>
                  {metric.score >= 65
                    ? "Indikasi positif"
                    : metric.score <= 35
                      ? "Perlu perhatian"
                      : "Perkembangan beragam"}
                </span>
                {activeBranch && (
                  <strong
                    className={
                      difference > 0
                        ? "metric-delta-positive"
                        : difference < 0
                          ? "metric-delta-negative"
                          : "metric-delta-neutral"
                    }
                  >
                    {difference > 0 ? "+" : ""}
                    {difference} vs. dunia awal
                  </strong>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="world-metrics-disclaimer">
        Skor dihitung secara lokal dari kata kunci pada judul, ringkasan, dan
        timeline. Skor bukan hasil pengukuran empiris atau penilaian AI; gunakan
        sebagai petunjuk visual saja.
      </p>
    </section>
  );
}

const MAP_LOCATIONS = [
  {
    name: "Indonesia",
    aliases: ["indonesia", "nusantara", "kepulauan indonesia"],
    x: 735,
    y: 315,
    region: "Asia Tenggara",
  },
  {
    name: "Jakarta",
    aliases: ["jakarta", "ibu kota indonesia"],
    x: 722,
    y: 323,
    region: "Asia Tenggara",
  },
  {
    name: "Asia Tenggara",
    aliases: ["asia tenggara", "asean"],
    x: 750,
    y: 300,
    region: "Asia",
  },
  {
    name: "Tiongkok",
    aliases: ["tiongkok", "china", "cina", "beijing", "shanghai"],
    x: 760,
    y: 225,
    region: "Asia Timur",
  },
  {
    name: "Jepang",
    aliases: ["jepang", "tokyo", "okinawa"],
    x: 830,
    y: 250,
    region: "Asia Timur",
  },
  {
    name: "India",
    aliases: ["india", "new delhi", "mumbai"],
    x: 665,
    y: 270,
    region: "Asia Selatan",
  },
  {
    name: "Rusia",
    aliases: ["rusia", "moskow", "moscow", "siberia"],
    x: 700,
    y: 165,
    region: "Eurasia",
  },
  {
    name: "Timur Tengah",
    aliases: [
      "timur tengah",
      "iran",
      "irak",
      "arab saudi",
      "palestina",
      "teheran",
      "riyadh",
    ],
    x: 570,
    y: 280,
    region: "Asia Barat",
  },
  {
    name: "Eropa",
    aliases: ["eropa", "uni eropa", "europe"],
    x: 490,
    y: 185,
    region: "Eropa",
  },
  {
    name: "Inggris",
    aliases: ["inggris", "britania", "london", "united kingdom"],
    x: 460,
    y: 175,
    region: "Eropa",
  },
  {
    name: "Prancis",
    aliases: ["prancis", "paris"],
    x: 480,
    y: 195,
    region: "Eropa",
  },
  {
    name: "Jerman",
    aliases: ["jerman", "berlin"],
    x: 505,
    y: 185,
    region: "Eropa",
  },
  {
    name: "Afrika",
    aliases: ["afrika", "africa", "sahara", "nairobi", "lagos"],
    x: 520,
    y: 340,
    region: "Afrika",
  },
  {
    name: "Amerika Serikat",
    aliases: [
      "amerika serikat",
      "amerika",
      "as",
      "washington",
      "new york",
      "los angeles",
      "usa",
      "united states",
    ],
    x: 240,
    y: 220,
    region: "Amerika Utara",
  },
  {
    name: "Kanada",
    aliases: ["kanada", "canada", "ottawa", "toronto"],
    x: 245,
    y: 150,
    region: "Amerika Utara",
  },
  {
    name: "Meksiko",
    aliases: ["meksiko", "mexico"],
    x: 280,
    y: 280,
    region: "Amerika Utara",
  },
  {
    name: "Brasil",
    aliases: ["brasil", "brazil", "brasilia", "sao paulo"],
    x: 340,
    y: 390,
    region: "Amerika Selatan",
  },
  {
    name: "Australia",
    aliases: ["australia", "sydney", "canberra", "melbourne"],
    x: 835,
    y: 410,
    region: "Oseania",
  },
  {
    name: "Dunia",
    aliases: [
      "seluruh dunia",
      "di seluruh dunia",
      "global",
      "internasional",
      "dunia internasional",
    ],
    x: 500,
    y: 85,
    region: "Global",
  },
];

function WorldEventMap({ scenario, timeline, activeBranch }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const events = Array.isArray(timeline) ? timeline : [];
  const locationEvents = MAP_LOCATIONS.map((location) => {
    const matchedEvents = events.filter((event) => {
      const text =
        `${event.title || ""} ${event.description || ""}`.toLocaleLowerCase(
          "id-ID",
        );
      return location.aliases.some((alias) => {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(
          `(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`,
          "iu",
        ).test(text);
      });
    });
    return { ...location, events: matchedEvents };
  }).filter((location) => location.events.length > 0);
  const locationNames = locationEvents
    .map((location) => location.name)
    .join("|");
  const selected =
    locationEvents.find((location) => location.name === selectedLocation) ||
    null;
  const locatedEventIds = new Set(
    locationEvents.flatMap((location) =>
      location.events.map(
        (event) => event.id || `${event.year}-${event.title}`,
      ),
    ),
  );
  const unlocatedEvents = events.filter(
    (event) => !locatedEventIds.has(event.id || `${event.year}-${event.title}`),
  );

  useEffect(() => {
    if (
      selectedLocation &&
      !locationNames.split("|").includes(selectedLocation)
    )
      setSelectedLocation(null);
  }, [selectedLocation, locationNames]);

  return (
    <section className="world-event-map" aria-label="Peta dunia alternatif">
      <div className="world-event-map-heading">
        <div>
          <span className="section-kicker">PETA DUNIA ALTERNATIF</span>
          <h3>
            {activeBranch
              ? `Peta peristiwa: ${activeBranch.title}`
              : `Peta peristiwa: ${scenario.title || "Dunia alternatif"}`}
          </h3>
          <p>
            Jelajahi lokasi yang disebut secara eksplisit dalam judul atau
            deskripsi peristiwa timeline.
          </p>
        </div>
        <span className="world-event-map-count">
          {locationEvents.length} lokasi terdeteksi
        </span>
      </div>
      <div className="world-event-map-layout">
        <div className="world-event-map-canvas">
          <svg
            viewBox="0 0 1000 520"
            role="img"
            aria-label="Peta skematis dunia dengan penanda lokasi peristiwa"
          >
            <defs>
              <pattern
                id="world-map-grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".08"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              width="1000"
              height="520"
              rx="18"
              fill="url(#world-map-grid)"
            />
            <g
              className="world-map-land"
              fill="currentColor"
              fillOpacity=".12"
              stroke="currentColor"
              strokeOpacity=".18"
              strokeWidth="2"
            >
              <path d="M92 110 L145 73 220 70 260 100 310 116 330 154 302 182 280 220 245 238 224 277 196 270 176 230 145 208 125 170 92 150Z" />
              <path d="M280 282 L321 292 354 330 363 372 344 424 325 463 302 430 292 387 270 351Z" />
              <path d="M430 116 L470 95 520 105 550 130 538 155 505 160 489 184 460 177 444 150Z" />
              <path d="M470 190 L520 184 560 215 573 260 554 314 535 366 510 390 485 350 475 305 450 268 455 225Z" />
              <path d="M530 108 L600 77 695 83 755 105 820 126 874 160 900 196 865 225 820 217 790 244 755 232 725 206 675 215 638 192 590 178 555 150Z" />
              <path d="M704 258 L755 268 786 295 770 326 740 334 714 310 690 286Z" />
              <path d="M785 365 L835 348 885 367 906 400 880 427 830 430 798 405Z" />
              <path d="M390 70 L430 56 456 72 440 92 408 91Z" />
            </g>
            <text
              x="500"
              y="495"
              textAnchor="middle"
              className="world-map-caption"
            >
              PETA SKEMATIS · BUKAN BATAS GEOGRAFIS PRESISI
            </text>
            {locationEvents.map((location) => (
              <g
                key={location.name}
                className={`world-map-marker${selectedLocation === location.name ? " is-selected" : ""}`}
                role="button"
                tabIndex="0"
                aria-label={`Lihat peristiwa di ${location.name}`}
                onClick={() =>
                  setSelectedLocation(
                    selectedLocation === location.name ? null : location.name,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedLocation(
                      selectedLocation === location.name ? null : location.name,
                    );
                  }
                }}
              >
                <circle
                  cx={location.x}
                  cy={location.y}
                  r={selectedLocation === location.name ? 16 : 12}
                />
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="4"
                  className="world-map-marker-core"
                />
                <text x={location.x} y={location.y - 20} textAnchor="middle">
                  {location.name}
                </text>
              </g>
            ))}
          </svg>
          <div className="world-map-legend">
            <span>
              <i /> Lokasi disebut di timeline
            </span>
            <span>Tekan penanda untuk melihat peristiwa</span>
          </div>
        </div>
        <aside className="world-event-map-details">
          {selected ? (
            <>
              <div className="world-map-detail-kicker">{selected.region}</div>
              <h4>{selected.name}</h4>
              <p className="world-map-detail-count">
                {selected.events.length} peristiwa terkait
              </p>
              {selected.events.map((event, index) => (
                <article
                  className="world-map-event"
                  key={event.id || `${event.year}-${index}`}
                >
                  <span>Tahun {event.year || "—"}</span>
                  <strong>{event.title || "Peristiwa tanpa judul"}</strong>
                  <p>{event.description || "Tidak ada deskripsi."}</p>
                </article>
              ))}
              <button
                type="button"
                className="world-map-clear"
                onClick={() => setSelectedLocation(null)}
              >
                Tampilkan ringkasan
              </button>
            </>
          ) : (
            <>
              <div className="world-map-detail-kicker">RINGKASAN PETA</div>
              <h4>Peristiwa berdasarkan lokasi</h4>
              <p>
                {locationEvents.length
                  ? `Ada ${locationEvents.length} lokasi yang cocok dengan penyebutan di timeline ini.`
                  : "Belum ada nama lokasi yang dikenali dalam timeline ini."}
              </p>
              {locationEvents.slice(0, 7).map((location) => (
                <button
                  type="button"
                  className="world-map-location-row"
                  key={location.name}
                  onClick={() => setSelectedLocation(location.name)}
                >
                  <span>
                    <strong>{location.name}</strong>
                    <small>{location.region}</small>
                  </span>
                  <b>{location.events.length}</b>
                </button>
              ))}
              {locationEvents.length > 7 && (
                <p className="world-map-more">
                  Pilih lokasi pada peta untuk membuka detail lainnya.
                </p>
              )}
            </>
          )}
        </aside>
      </div>
      {unlocatedEvents.length > 0 && (
        <details className="world-map-unlocated">
          <summary>
            {unlocatedEvents.length} peristiwa tanpa lokasi yang dikenali
          </summary>
          <div>
            {unlocatedEvents.map((event, index) => (
              <article key={event.id || `${event.year}-${index}`}>
                <span>Tahun {event.year || "—"}</span>
                <strong>{event.title || "Peristiwa tanpa judul"}</strong>
                <p>{event.description || "Tidak ada deskripsi."}</p>
              </article>
            ))}
          </div>
        </details>
      )}
      <p className="world-map-disclaimer">
        Peta ini bersifat skematis. Lokasi ditandai berdasarkan pencocokan kata
        kunci secara lokal, bukan hasil ekstraksi AI atau verifikasi geografis.
        Jika lokasi tidak disebutkan dengan jelas, JikAI tidak menebaknya.
      </p>
    </section>
  );
}

function WorldReportPanel({ scenario, timeline, activeBranch }) {
  const [format, setFormat] = useState("koran");
  const currentTimeline = Array.isArray(timeline) ? timeline : [];
  const latestEvent = currentTimeline[currentTimeline.length - 1];
  const supportingEvents = currentTimeline.slice(0, -1).slice(-2).reverse();
  const worldTitle =
    activeBranch?.title || scenario.title || "Dunia Alternatif";
  const latestYear =
    latestEvent?.year || scenario.startYear || "Tidak diketahui";
  const leadTitle =
    latestEvent?.title || scenario.title || "Perkembangan dunia";
  const leadDescription =
    latestEvent?.description ||
    scenario.premise ||
    "Belum ada peristiwa pada timeline ini.";
  const formatDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className="world-report-panel"
      aria-label="Koran dan laporan dunia alternatif"
    >
      <div className="world-report-controls no-print">
        <div>
          <span className="section-kicker">DOKUMEN DUNIA ALTERNATIF</span>
          <h3>Koran dan laporan dunia</h3>
          <p>
            Ubah kejadian dalam timeline menjadi dokumen yang bisa dicetak atau
            disimpan sebagai PDF.
          </p>
        </div>
        <div className="world-report-actions">
          <div
            className="world-report-format-switch"
            role="group"
            aria-label="Pilih format dokumen"
          >
            <button
              type="button"
              className={format === "koran" ? "is-active" : ""}
              onClick={() => setFormat("koran")}
              aria-pressed={format === "koran"}
            >
              Koran
            </button>
            <button
              type="button"
              className={format === "laporan" ? "is-active" : ""}
              onClick={() => setFormat("laporan")}
              aria-pressed={format === "laporan"}
            >
              Laporan
            </button>
          </div>
          <button
            type="button"
            className="world-report-print-button"
            onClick={() => window.print()}
          >
            <span aria-hidden="true">↗</span> Cetak / Simpan PDF
          </button>
        </div>
      </div>

      <article
        className={`world-report-document ${format === "koran" ? "is-newspaper" : "is-report"}`}
      >
        <header className="world-report-masthead">
          <div className="world-report-brand">
            JIKAI <span>· DOKUMEN SIMULASI</span>
          </div>
          <div className="world-report-issue">
            <span>Edisi dunia alternatif</span>
            <strong>{formatDate}</strong>
          </div>
        </header>
        {format === "koran" ? (
          <>
            <div className="world-report-rule" />
            <p className="world-report-eyebrow">
              LAPORAN KHUSUS · TAHUN {latestYear}
            </p>
            <h2 className="world-report-headline">{leadTitle}</h2>
            <p className="world-report-deck">
              Perkembangan terbaru dari <strong>{worldTitle}</strong> membentuk
              arah baru bagi dunia dalam skenario ini.
            </p>
            <div className="world-report-byline">
              BULETIN SIMULASI JIKAI <span>•</span> {worldTitle}
            </div>
            <div className="world-report-lead">{leadDescription}</div>
            {activeBranch && (
              <div className="world-report-choice">
                <strong>Titik perubahan:</strong>{" "}
                {activeBranch.choice || "Keputusan alternatif"}
              </div>
            )}
            {supportingEvents.length > 0 && (
              <div className="world-report-related">
                <h3>Peristiwa yang membawa dunia ke sini</h3>
                {supportingEvents.map((event, index) => (
                  <section
                    className="world-report-related-item"
                    key={event.id || `${event.year}-${index}`}
                  >
                    <span>Tahun {event.year}</span>
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                  </section>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="world-report-eyebrow">
              LAPORAN PERKEMBANGAN · TAHUN {latestYear}
            </p>
            <h2 className="world-report-headline">
              Ringkasan kondisi: {worldTitle}
            </h2>
            <p className="world-report-deck">
              Laporan ini merangkum titik perubahan, kondisi terbaru, dan
              rangkaian peristiwa dalam simulasi.
            </p>
            <section className="world-report-report-section">
              <h3>Ringkasan terbaru</h3>
              <h4>{leadTitle}</h4>
              <p>{leadDescription}</p>
            </section>
            <section className="world-report-report-section">
              <h3>Latar skenario</h3>
              <p>
                {scenario.premise ||
                  scenario.prompt ||
                  "Tidak ada ringkasan awal yang tersedia."}
              </p>
              {activeBranch && (
                <p>
                  <strong>Keputusan alternatif:</strong> {activeBranch.choice}
                </p>
              )}
            </section>
            <section className="world-report-report-section">
              <h3>Riwayat peristiwa</h3>
              {currentTimeline.map((event, index) => (
                <div
                  className="world-report-timeline-row"
                  key={event.id || `${event.year}-${index}`}
                >
                  <span>{event.year}</span>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
        <footer className="world-report-footer">
          <strong>JikAI</strong>
          <span>
            Dokumen dari simulasi hipotetis. Bukan berita nyata, fakta
            terverifikasi, atau prediksi pasti.
          </span>
        </footer>
      </article>
      <p className="world-report-note no-print">
        Dokumen dibuat secara lokal dari data simulasi yang sudah tersedia.
        Fitur ini tidak memanggil AI tambahan.
      </p>
    </section>
  );
}

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

function BranchTimeline({
  branch,
  onExplore,
  selectedEvent,
  customChoice,
  setCustomChoice,
  branchLoading,
  branchError,
  onChooseBranch,
  onContinueTimeline,
  continuationLoading,
  continuationBusy,
  continuationError,
}) {
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
            <div className="branch-event-content">
              <span className="timeline-event-year">Tahun {event.year}</span>
              <h5>{event.title}</h5>
              <p>{event.description}</p>
              <button
                type="button"
                className="timeline-branch-trigger branch-nested-trigger"
                onClick={() => onExplore(event, branch.id)}
                aria-expanded={Boolean(
                  selectedEvent &&
                  eventIdentity(selectedEvent) === eventIdentity(event) &&
                  selectedEvent.parentBranchId === branch.id,
                )}
              >
                <span aria-hidden="true">⑂</span>
                {selectedEvent &&
                eventIdentity(selectedEvent) === eventIdentity(event) &&
                selectedEvent.parentBranchId === branch.id
                  ? "Tutup pilihan cabang"
                  : "Buat cabang dari peristiwa ini"}
              </button>
              {selectedEvent &&
                eventIdentity(selectedEvent) === eventIdentity(event) &&
                selectedEvent.parentBranchId === branch.id && (
                  <div className="branch-choice-panel branch-nested-choice-panel">
                    <span className="scenario-result-label">
                      TENTUKAN KEPUTUSAN LANJUTAN
                    </span>
                    <p>
                      Cabang baru akan dibuat dari peristiwa{" "}
                      <strong>{event.title}</strong> di dunia{" "}
                      <strong>{branch.title}</strong>.
                    </p>
                    <label
                      className="branch-custom-choice-label"
                      htmlFor={`nested-branch-choice-${branch.id}-${eventIdentity(event)}`}
                    >
                      Keputusan alternatif
                    </label>
                    <textarea
                      id={`nested-branch-choice-${branch.id}-${eventIdentity(event)}`}
                      className="branch-custom-choice-input"
                      value={customChoice}
                      onChange={(inputEvent) =>
                        setCustomChoice(inputEvent.target.value)
                      }
                      placeholder="Tuliskan keputusan berbeda yang ingin kamu simulasikan..."
                      maxLength={240}
                      rows={3}
                      disabled={branchLoading}
                    />
                    <div className="branch-custom-choice-footer">
                      <span className="branch-custom-choice-hint">
                        Keputusan ini akan menjadi cabang baru tepat di bawah
                        dunia ini.
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
                      onClick={() => onChooseBranch(customChoice.trim())}
                      disabled={branchLoading || !customChoice.trim()}
                    >
                      {branchLoading
                        ? "Menyimulasikan..."
                        : "Buat cabang lanjutan ↗"}
                    </button>
                    {branchLoading && (
                      <div className="branch-loading" role="status">
                        <span className="scenario-loading-spinner" />
                        <span>
                          JikAI sedang menyimulasikan cabang lanjutan...
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
          </article>
        ))}
      </div>
      <div className="timeline-continue-actions">
        <button
          type="button"
          className="timeline-continue-button"
          onClick={onContinueTimeline}
          disabled={continuationBusy || branch.timeline.length >= 18}
        >
          {continuationLoading
            ? "Melanjutkan simulasi..."
            : "Lanjutkan dunia ini +3 peristiwa →"}
        </button>
        {branch.timeline.length >= 18 && (
          <span className="timeline-continue-note">
            Kelanjutan berhenti agar jumlah peristiwa tidak melewati batas 20
            per dunia.
          </span>
        )}
        {continuationError && (
          <p className="branch-error" role="alert">
            {continuationError}
          </p>
        )}
        {continuationLoading && (
          <div className="branch-loading" role="status">
            <span className="scenario-loading-spinner" />
            <span>JikAI sedang melanjutkan perkembangan dunia ini...</span>
          </div>
        )}
      </div>
      <p className="branch-disclaimer">
        Cabang ini adalah salah satu kemungkinan hipotetis, bukan prediksi
        pasti.
      </p>
    </section>
  );
}

function BranchTreeNodes({
  branches,
  parentBranchId = null,
  activeBranchId,
  onSelect,
}) {
  const children = branches.filter(
    (branch) => (branch.parentBranchId ?? null) === parentBranchId,
  );
  if (!children.length) return null;

  return (
    <div
      className={parentBranchId ? "branch-tree-children" : "branch-tree-list"}
    >
      {children.map((branch) => (
        <div className="branch-tree-node" key={branch.id}>
          <button
            type="button"
            className={`branch-tree-item${branch.id === activeBranchId ? " is-active" : ""}`}
            onClick={() => onSelect(branch.id)}
            aria-pressed={branch.id === activeBranchId}
          >
            <span className="branch-tree-connector" aria-hidden="true">
              ↳
            </span>
            <span className="branch-tree-item-content">
              <strong>{branch.title}</strong>
              <span>
                {branch.originEvent?.year
                  ? `Tahun ${branch.originEvent.year} · `
                  : ""}
                {branch.originEvent?.title || "Peristiwa awal"}
              </span>
              <span className="branch-tree-choice">
                Pilihan: {branch.choice}
              </span>
            </span>
            <span className="branch-tree-open">
              {branch.id === activeBranchId ? "Sedang dibuka" : "Buka cabang →"}
            </span>
          </button>
          <BranchTreeNodes
            branches={branches}
            parentBranchId={branch.id}
            activeBranchId={activeBranchId}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

export default function ScenarioResult({ scenario }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [customChoice, setCustomChoice] = useState("");
  const [branches, setBranches] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [continuationLoading, setContinuationLoading] = useState("");
  const [continuationError, setContinuationError] = useState("");
  const [continuationErrorFor, setContinuationErrorFor] = useState("");
  const [activeBranchId, setActiveBranchId] = useState(null);
  const activeBranch =
    branches.find((branch) => branch.id === activeBranchId) || null;
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
    setTimelineEvents(
      Array.isArray(progress?.timelineEvents)
        ? progress.timelineEvents
        : Array.isArray(scenario.timeline)
          ? scenario.timeline
          : [],
    );
    const restoredBranches = Array.isArray(progress?.branches)
      ? progress.branches
      : progress?.activeBranch
        ? [progress.activeBranch]
        : [];
    setBranches(restoredBranches);
    setActiveBranchId(
      progress?.activeBranchId ??
        progress?.activeBranch?.id ??
        restoredBranches[0]?.id ??
        null,
    );
    setComparison(progress?.comparison ?? null);

    setBranchError("");
    setComparisonError("");
    setContinuationError("");
    setContinuationErrorFor("");
    setBranchLoading(false);
    setComparisonLoading(false);

    setRestoredScenarioId(scenario.id);
  }, [scenario?.id]);

  // Simpan progres setiap kali pengguna membuat perubahan.
  useEffect(() => {
    if (!scenario?.id || restoredScenarioId !== scenario.id) return;

    saveSimulationProgress(scenario.id, {
      selectedEvent,
      timelineEvents,
      branches,
      activeBranchId,
      // Tetap simpan activeBranch untuk kompatibilitas dengan progres versi lama.
      activeBranch,
      comparison,
    });
  }, [
    scenario?.id,
    restoredScenarioId,
    selectedEvent,
    timelineEvents,
    branches,
    activeBranchId,
    activeBranch,
    comparison,
  ]);

  // Membuat gambar untuk skenario.
  useEffect(() => {
    if (!scenario?.id) return;

    let cancelled = false;
    const cacheKey = `scenario:v3:${scenario.id}`;

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
    scenario?.prompt,
    scenario?.visualFocus,
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
    const cacheKey = `timeline:v3:${scenario.id}:${eventIdentity(selectedEvent)}`;

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
          userPrompt: scenario.prompt,
          category: scenario.category,
          visualFocus: `${selectedEvent.title}. ${selectedEvent.description}`,
          pointOfDivergence:
            `Tahun ${selectedEvent.year}. ` +
            `Peristiwa dalam skenario: ${scenario.prompt || scenario.title}.`,
          timelineContext: `Tahun ${selectedEvent.year}: ${selectedEvent.title}. ${selectedEvent.description}`,
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
      "branch:v3",
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
          userPrompt: scenario.prompt,
          category: scenario.category,
          visualFocus: `${activeBranch.title}. ${activeBranch.summary}`,
          pointOfDivergence:
            `Cabang dari ide pengguna: "${scenario.prompt || scenario.title}". ` +
            `Pilihan: ${activeBranch.choice}.`,
          timelineContext: (activeBranch.timeline || [])
            .slice(0, 3)
            .map(
              (event) => `${event.year}: ${event.title} — ${event.description}`,
            )
            .join("; "),
          choice: activeBranch.choice,
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
  const timeline =
    timelineEvents.length > 0
      ? timelineEvents
      : Array.isArray(scenario.timeline)
        ? scenario.timeline
        : [];

  function toggleEvent(event, parentBranchId = null) {
    const eventForBranch = { ...event, parentBranchId };
    setSelectedEvent((current) =>
      current &&
      eventIdentity(current) === eventIdentity(event) &&
      (current.parentBranchId ?? null) === parentBranchId
        ? null
        : eventForBranch,
    );
    setCustomChoice("");
    setBranchError("");
  }

  async function chooseBranch(choice) {
    if (!selectedEvent || branchLoading) return;
    setBranchLoading(true);
    setBranchError("");
    setComparison(null);
    setComparisonError("");
    try {
      const parentBranch = selectedEvent.parentBranchId
        ? branches.find((item) => item.id === selectedEvent.parentBranchId) ||
          null
        : null;
      const ancestry = [];
      let ancestor = parentBranch?.parentBranchId
        ? branches.find((item) => item.id === parentBranch.parentBranchId) ||
          null
        : null;
      while (ancestor) {
        ancestry.unshift({
          title: ancestor.title,
          summary: ancestor.summary,
          choice: ancestor.choice,
          timeline: ancestor.timeline || [],
        });
        ancestor = ancestor.parentBranchId
          ? branches.find((item) => item.id === ancestor.parentBranchId) || null
          : null;
      }
      const parentTimeline = parentBranch?.timeline || [];
      const selectedParentEventIndex = parentTimeline.findIndex(
        (item) => eventIdentity(item) === eventIdentity(selectedEvent),
      );
      const timelineAtDecision =
        selectedParentEventIndex >= 0
          ? parentTimeline.slice(0, selectedParentEventIndex + 1)
          : parentTimeline;
      const branch = await generateTimelineBranch({
        scenario,
        event: selectedEvent,
        choice,
        parentBranch: parentBranch
          ? { ...parentBranch, timeline: timelineAtDecision, ancestry }
          : null,
      });
      const branchWithOrigin = {
        ...branch,
        originEvent: selectedEvent,
        choice,
        parentBranchId: selectedEvent.parentBranchId ?? null,
        createdAt: new Date().toISOString(),
      };
      setBranches((current) => [branchWithOrigin, ...current]);
      setActiveBranchId(branchWithOrigin.id);
      setSelectedEvent(null);
    } catch (error) {
      setBranchError(
        error.message || "Cabang alternatif gagal dibuat. Coba lagi.",
      );
    } finally {
      setBranchLoading(false);
    }
  }

  async function handleContinueTimeline(targetBranch = null) {
    const worldKey = targetBranch?.id || "original";
    const currentTimeline = targetBranch?.timeline || timeline;
    if (continuationLoading || currentTimeline.length >= 18) return;
    setContinuationLoading(worldKey);
    setContinuationError("");
    setContinuationErrorFor(worldKey);
    try {
      const events = await continueWorldTimeline({
        scenario,
        world: targetBranch
          ? {
              title: targetBranch.title,
              summary: targetBranch.summary,
              choice: targetBranch.choice,
            }
          : { title: scenario.title, summary: scenario.premise, choice: "" },
        timeline: currentTimeline,
      });
      if (targetBranch) {
        setBranches((current) =>
          current.map((branch) =>
            branch.id === targetBranch.id
              ? { ...branch, timeline: [...(branch.timeline || []), ...events] }
              : branch,
          ),
        );
        setComparison(null);
        setComparisonError("");
      } else {
        setTimelineEvents((current) => [
          ...(current.length ? current : scenario.timeline || []),
          ...events,
        ]);
      }
    } catch (error) {
      setContinuationError(
        error.message || "Timeline gagal dilanjutkan. Silakan coba lagi.",
      );
      setContinuationErrorFor(worldKey);
    } finally {
      setContinuationLoading("");
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
        originalTimeline: timeline,
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
                (selectedEvent.parentBranchId ?? null) === null &&
                eventIdentity(selectedEvent) === eventIdentity(event)
              }
            />
            {selectedEvent &&
              (selectedEvent.parentBranchId ?? null) === null &&
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
      <div className="timeline-continue-actions">
        <button
          type="button"
          className="timeline-continue-button"
          onClick={() => handleContinueTimeline()}
          disabled={Boolean(continuationLoading) || timeline.length >= 18}
        >
          {continuationLoading === "original"
            ? "Melanjutkan simulasi..."
            : "Lanjutkan ke periode berikutnya +3 peristiwa →"}
        </button>
        <span className="timeline-continue-note">
          JikAI akan melanjutkan dari peristiwa terakhir tanpa mengulang
          kejadian sebelumnya.
        </span>
        {timeline.length >= 18 && (
          <span className="timeline-continue-note">
            Kelanjutan berhenti agar jumlah peristiwa tidak melewati batas 20
            per dunia.
          </span>
        )}
        {continuationError && continuationErrorFor === "original" && (
          <p className="branch-error" role="alert">
            {continuationError}
          </p>
        )}
        {continuationLoading === "original" && (
          <div className="branch-loading" role="status">
            <span className="scenario-loading-spinner" />
            <span>JikAI sedang melanjutkan perkembangan dunia awal...</span>
          </div>
        )}
      </div>

      {branches.length > 0 && (
        <section className="branch-tree-panel" aria-label="Pohon cabang dunia">
          <div className="branch-tree-heading">
            <div>
              <span className="section-kicker">POHON CABANG DUNIA</span>
              <h3>Jelajahi kemungkinan lain</h3>
              <p>
                Setiap pilihan menghasilkan dunia alternatif tersendiri. Pilih
                cabang untuk membuka kembali hasilnya.
              </p>
            </div>
            <span className="timeline-count">{branches.length} cabang</span>
          </div>
          <div className="branch-tree-root">
            <span className="branch-tree-root-icon" aria-hidden="true">
              ◎
            </span>
            <div>
              <strong>{scenario.title}</strong>
              <span>Dunia awal</span>
            </div>
          </div>
          <BranchTreeNodes
            branches={branches}
            activeBranchId={activeBranchId}
            onSelect={(branchId) => {
              setActiveBranchId(branchId);
              setComparison(null);
              setComparisonError("");
              setContinuationError("");
              setContinuationErrorFor("");
              setSelectedEvent(null);
            }}
          />
        </section>
      )}

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

          <BranchTimeline
            branch={activeBranch}
            onExplore={toggleEvent}
            selectedEvent={selectedEvent}
            customChoice={customChoice}
            setCustomChoice={setCustomChoice}
            branchLoading={branchLoading}
            branchError={branchError}
            onChooseBranch={chooseBranch}
            onContinueTimeline={() => handleContinueTimeline(activeBranch)}
            continuationLoading={continuationLoading === activeBranch.id}
            continuationBusy={Boolean(continuationLoading)}
            continuationError={
              continuationErrorFor === activeBranch.id ? continuationError : ""
            }
          />

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
                setActiveBranchId(null);
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

      <WorldMetricsPanel
        scenario={scenario}
        originalTimeline={timeline}
        activeBranch={activeBranch}
      />

      <WorldEventMap
        scenario={scenario}
        timeline={activeBranch?.timeline || timeline}
        activeBranch={activeBranch}
      />

      <WorldReportPanel
        scenario={scenario}
        timeline={activeBranch?.timeline || timeline}
        activeBranch={activeBranch}
      />

      <p className="scenario-result-disclaimer">
        {scenario.disclaimer ||
          "Skenario ini bersifat hipotetis dan bukan prediksi masa depan."}
      </p>
    </section>
  );
}
