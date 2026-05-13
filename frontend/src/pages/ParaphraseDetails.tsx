import { useEffect, useState } from "react";
import { ParaphraseRun } from "../types/api";
import { paraphraseApi } from "../services/api/paraphrase";
import { useNavigate, useParams } from "react-router-dom";

export const ParaphraseDetails = () => {
  const navigate = useNavigate();
  const [paraphrase, setParaphrase] = useState<ParaphraseRun>();
  const { paraphraseRunId = "" } = useParams();
  const [Loading, setIsLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await paraphraseApi.getParaphrase(paraphraseRunId);
        setParaphrase(data);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    if (paraphraseRunId) load();
  }, [paraphraseRunId]);

  return (
    <div className="content-layout">
      <p className="muted-text">
        <button onClick={() => navigate(-1)}>Back</button>
      </p>
      <div className="">
        <div className="review-layout two-column">
          <div className="card ">
            <h2>Original Text</h2>
            <p>{paraphrase?.originalText}</p>
          </div>
          <div className="card">
            <h2>Paraphrase Text</h2>
            <p>{paraphrase?.paraphrasedText}</p>
          </div>
        </div>
        <div className="review-layout">
          {paraphrase?.changes?.length ? (
            <>
              <div className="review-grid">
                <h3>Changes</h3>
                {paraphrase?.changes?.map((change, index) => (
                  <ul key={index}>
                    <li>
                      <strong>Original Text: </strong> {change.originalPhrase}
                    </li>
                    <li>
                      <strong>Paraphrase Text: </strong> {change.replacedWith}
                    </li>
                    <li>
                      <strong>Reasons: </strong> {change.reason}
                    </li>
                  </ul>
                ))}
              </div>
            </>
          ) : null}
          {paraphrase?.grammarTips?.length ? (
            <>
              <div className="review-grid">
                <h3>Grammer Tips</h3>
                {paraphrase.grammarTips.map((grammer, index) => (
                  <ul key={index}>
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
          {paraphrase?.metrics?.length ? (
            <>
              <div className="review-grid">
                <h3>Metrics</h3>
                {paraphrase.metrics.map((metric, index) => (
                  <ul key={index}>
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
                      <strong>Retionale: </strong>
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
                {paraphrase?.tone}
              </li>
              <li>
                <strong>length: </strong>
                {paraphrase?.lengthStrategy}
              </li>
              <li>
                <strong>Preserved words: </strong>
                {paraphrase?.preservedWords.length ? (
                  paraphrase?.preservedWords.join(",")
                ) : (
                  <span className="badge">Not used</span>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
