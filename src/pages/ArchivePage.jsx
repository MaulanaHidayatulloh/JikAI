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
        <span className="section-kicker">KOLEKSI PRIBADI</span>
        <h1>Arsip Simulasi</h1>
        <p>Semua dunia yang pernah kamu ciptakan, tersimpan di satu tempat.</p>
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
