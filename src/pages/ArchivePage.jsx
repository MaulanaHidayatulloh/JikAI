import { useNavigate } from "react-router-dom";
import ScenarioLibrary from "../components/ScenarioLibrary";

export default function ArchivePage({ savedScenarios, onDelete, onOpen }) {
  const navigate = useNavigate();

  function openScenario(scenario) {
    onOpen(scenario);
    navigate("/simulasi");
  }

  return (
    <main className="archive-page">
      <div className="archive-page-heading">
        <span className="section-kicker">ARSIP PRIBADI</span>

        <div className="archive-heading-row">
          <h1>Arsip Simulasi</h1>
          <span className="library-count">
            {savedScenarios.length} simulasi
          </span>
        </div>

        <p>
          Semua dunia yang pernah kamu ciptakan, tersimpan di satu tempat.
          Simpan dan jelajahi kembali kemungkinan yang pernah kamu ciptakan.
        </p>
      </div>

      <ScenarioLibrary
        scenarios={savedScenarios}
        currentScenario={null}
        onSaveCurrent={() => {}}
        onOpen={openScenario}
        onDelete={onDelete}
      />
    </main>
  );
}
