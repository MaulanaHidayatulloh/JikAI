import { useNavigate } from "react-router-dom";

import HeroSection from "../components/HeroSection";
import ExampleScenarios from "../components/ExampleScenarios";

export default function HomePage({ onChooseExample }) {
  const navigate = useNavigate();

  function startSimulation() {
    navigate("/simulasi");
  }

  function chooseExample(example) {
    onChooseExample(example);
    navigate("/simulasi");
  }

  return (
    <>
      <HeroSection onExplore={startSimulation} />

      <section className="home-intro">
        <div className="section-heading">
          <div>
            <span className="section-kicker">JIKAI UNIVERSE</span>
            <h2>Satu pertanyaan. Banyak kemungkinan.</h2>
            <p>
              Ubah satu keputusan, peristiwa, atau gagasan menjadi dunia
              alternatif yang dapat kamu jelajahi.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="button-primary"
          onClick={startSimulation}
        >
          Mulai Simulasi →
        </button>
      </section>

      <ExampleScenarios onChoose={chooseExample} />
    </>
  );
}
