import { LengthStrategy, ParaphraseRun, ToneType } from "../types/api";
import { paraphraseApi } from "../services/api/paraphrase";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { ParaphraseList } from "./paraphraseList";
import { projectsApi } from "../services/api/projects";

interface ParaphrasePanelProps {
  paraphrase: ParaphraseRun;
  sectionId: string;
  content: string;
  sectionKey: string;
}
export const ParaphrasePanel = ({
  paraphrase,
  sectionId,
  content,
  sectionKey,
}: ParaphrasePanelProps) => {
  const { projectId = "" } = useParams();
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [selectedTone, setSelectedTone] = useState("Simple");
  const [selectedLength, setSelectedLength] = useState("Shorten");
  const [latestParaphrase, setLatestParaphrase] =
    useState<ParaphraseRun | null>(null);
  const [inputWords, setInputWords] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleParaphrase = async () => {
    if (!projectId) return;
    try {
      await projectsApi.updateSection(projectId, sectionKey, {
        content,
        changeSummary: "Saved before AI review",
      });
      const finalWords = inputWords
        .split(/[,\s]+/)
        .map((word) => word.trim())
        .filter((word) => word !== "");
      setInputWords("");
      setIsParaphrasing(true);
      const result = await paraphraseApi.triggerParaphrase({
        projectId: projectId,
        sectionId: sectionId,
        tone: selectedTone.toLocaleUpperCase() as ToneType,
        lengthStrategy: selectedLength.toLocaleUpperCase() as LengthStrategy,
        preservedWords: finalWords,
      });
      if (result) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } finally {
      setIsParaphrasing(false);
    }
  };

  const updateTopPanel = (latest: ParaphraseRun[]) => {
    setLatestParaphrase(latest?.[0] ?? null);
  };
  const currentData = latestParaphrase;

  return (
    <div>
      <div className="content-layout">
        <div className="paraphrase-header">
          <h3>Paraphrase this section</h3>
        </div>
        <div className="card">
          <div className="paraphrase-wrapper">
            <div className="tone-wrapper">
              <strong>Tone</strong>
              {["Simple", "Academic", "Casual", "Natural"].map(
                (tone, index) => (
                  <button
                    key={index}
                    className={`tone-button ${selectedTone === tone ? "active" : ""}`}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                  >
                    {tone}
                  </button>
                ),
              )}
            </div>
            <div className="length-wrapper">
              <strong>Length</strong>
              {["Shorten", "Maintain"].map((len, index) => (
                <button
                  key={index}
                  className={`length-button ${selectedLength === len ? "active" : ""}`}
                  type="button"
                  onClick={() => setSelectedLength(len)}
                >
                  {len}
                </button>
              ))}
            </div>
            <div className="trigger-paraphrase">
              <button
                className="outline-button"
                type="button"
                disabled={!sectionId}
                onClick={handleParaphrase}
              >
                {!sectionId || !isParaphrasing
                  ? "Paraphrase"
                  : "Paraphrasing..."}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="" className="field">
              <strong>Preserved Words </strong>
              <input
                type="text"
                name=""
                id=""
                value={inputWords}
                onChange={(e) => setInputWords(e.target.value)}
              />
            </label>
          </div>
        </div>

        {currentData ? (
          <div className="">
            <div className="review-layout two-column">
              <div className="card ">
                <h2>Original Text</h2>
                <p>{currentData.originalText}</p>
              </div>
              <div className="card">
                <h2>Paraphrase Text</h2>
                <p>{currentData.paraphrasedText}</p>
              </div>
            </div>
            <div className="review-layout">
              {currentData.changes?.length ? (
                <>
                  <div className="review-grid">
                    <h3>Changes</h3>
                    {currentData.changes?.map((change, index) => (
                      <ul key={currentData.id || index}>
                        <li>
                          <strong>Original Text: </strong>{" "}
                          {change.originalPhrase}
                        </li>
                        <li>
                          <strong>Paraphrase Text: </strong>{" "}
                          {change.replacedWith}
                        </li>
                        <li>
                          <strong>Reasons: </strong> {change.reason}
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : null}
              {currentData.grammarTips?.length ? (
                <>
                  <div className="review-grid">
                    <h3>Grammar Tips</h3>
                    {currentData.grammarTips.map((grammer, index) => (
                      <ul key={currentData.id || index}>
                        <li>
                          <strong>Name: </strong> {grammer.ruleName}
                        </li>
                        <li>
                          <strong>Explain: </strong> {grammer.explanation}
                        </li>
                        <li>
                          <strong>Example: </strong> {grammer.example}
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : null}
              {currentData.metrics?.length ? (
                <>
                  <div className="review-grid">
                    <h3>Metrics</h3>
                    {currentData.metrics.map((metric, index) => (
                      <ul key={currentData.id || index}>
                        <li>
                          <strong>Name: </strong> {metric.name}
                        </li>
                        <li>
                          <strong>Label: </strong>
                          {metric.label}
                        </li>
                        <li>
                          <strong>Score: </strong>
                          {metric.score}
                        </li>
                        <li>
                          <strong>Rationale: </strong>
                          {metric.retionale}
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : null}
              <div className="review-grid">
                <ul>
                  <h3>Other Options</h3>
                  <li>
                    <strong>Tone: </strong>
                    {currentData.tone}
                  </li>
                  <li>
                    <strong>length: </strong>
                    {currentData.lengthStrategy}
                  </li>
                  <li>
                    <strong>Preserved words: </strong>
                    {currentData.preservedWords.length ? (
                      currentData.preservedWords.join(",")
                    ) : (
                      <span className="badge">Not used</span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <h3>Latest Paraphrase</h3>
            <p className="muted-text">
              No paraphrase has been run for this section yet.
            </p>
          </div>
        )}
      </div>

      <ParaphraseList
        projectId={projectId}
        sectionId={sectionId}
        refreshTrigger={refreshTrigger}
        onListChange={updateTopPanel}
      />
    </div>
  );
};
