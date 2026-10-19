import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SimulationPage from "./pages/SimulationPage";
import ArchivePage from "./pages/ArchivePage";

import { generateScenario } from "./services/simulationService";
import {
  getSavedScenarios,
  saveScenarioToStorage,
  deleteScenarioFromStorage,
} from "./services/storageService";

import "./styles/global.css";

export default function App() {
  const [selectedMode, setSelectedMode] = useState("alternate_history");
  const [question, setQuestion] = useState("");
  const [scenarioDraft, setScenarioDraft] = useState(null);
  const [generatedScenario, setGeneratedScenario] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [savedScenarios, setSavedScenarios] = useState(() =>
    getSavedScenarios(),
  );

  function handleChooseExample(example) {
    setQuestion(example);
    setScenarioDraft(null);
    setGeneratedScenario(null);
    setErrorMessage("");
  }

  function handleModeSelect(id) {
    setSelectedMode(id);
    setScenarioDraft(null);
    setGeneratedScenario(null);
    setErrorMessage("");
  }

  async function handleGenerateScenario(data) {
    setIsGenerating(true);
    setErrorMessage("");
    setGeneratedScenario(null);
    setScenarioDraft(data);

    try {
      const scenario = await generateScenario(data);
      setGeneratedScenario(scenario);

      window.setTimeout(() => {
        document.getElementById("scenario-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Gagal membuat skenario JikAI:", error);
      setErrorMessage(
        error.message || "Terjadi kesalahan saat membuat skenario.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setScenarioDraft(null);
    setGeneratedScenario(null);
    setErrorMessage("");
  }

  function handleSaveCurrentScenario() {
    if (!generatedScenario) return;

    try {
      const updated = saveScenarioToStorage(generatedScenario);
      setSavedScenarios(updated);
      setErrorMessage("");
    } catch (error) {
      console.error("Gagal menyimpan simulasi:", error);
      setErrorMessage(
        "Simulasi gagal disimpan. Periksa ruang penyimpanan browser.",
      );
    }
  }

  function handleDeleteSavedScenario(id) {
    try {
      setSavedScenarios(deleteScenarioFromStorage(id));
    } catch (error) {
      console.error("Gagal menghapus simulasi:", error);
      setErrorMessage("Simulasi gagal dihapus dari arsip.");
    }
  }

  function handleOpenSavedScenario(scenario) {
    setSelectedMode(scenario.category || "alternate_history");
    setQuestion(scenario.prompt || "");
    setScenarioDraft(null);
    setGeneratedScenario(scenario);
    setErrorMessage("");

    window.setTimeout(() => {
      document.getElementById("scenario-result")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<HomePage onChooseExample={handleChooseExample} />}
        />

        <Route
          path="/simulasi"
          element={
            <SimulationPage
              selectedMode={selectedMode}
              onModeSelect={handleModeSelect}
              question={question}
              setQuestion={setQuestion}
              onGenerate={handleGenerateScenario}
              isGenerating={isGenerating}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage("")}
              scenarioDraft={scenarioDraft}
              onReset={handleReset}
              generatedScenario={generatedScenario}
              onSaveCurrent={handleSaveCurrentScenario}
            />
          }
        />

        <Route
          path="/arsip"
          element={
            <ArchivePage
              savedScenarios={savedScenarios}
              onDelete={handleDeleteSavedScenario}
              onOpen={handleOpenSavedScenario}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="footer">
        <a href="/" className="brand footer-brand">
          <span>
            Jik<span className="brand-accent">AI</span>
          </span>
        </a>

        <p>
          Jelajahi kemungkinan. Pahami konsekuensi. Bayangkan dunia yang
          berbeda.
        </p>

        <span className="footer-copy">© {new Date().getFullYear()} JikAI</span>
      </footer>
    </>
  );
}
