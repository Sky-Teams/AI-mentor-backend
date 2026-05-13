import { useEffect, useState } from "react";
import { ParaphraseRun } from "../types/api";
import { paraphraseApi } from "../services/api/paraphrase";
import { useNavigate } from "react-router-dom";

interface ParaphraseListProps {
  projectId: string;
  sectionId: string;
  refreshTrigger: number;
  onListChange: (newList: ParaphraseRun[]) => void;
}
export const ParaphraseList = ({
  projectId,
  sectionId,
  refreshTrigger,
  onListChange,
}: ParaphraseListProps) => {
  const navigate = useNavigate();
  const [paraphrase, setParaphrase] = useState<ParaphraseRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  useEffect(() => {
    if (!projectId || !sectionId) return;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await paraphraseApi.getSectionParaphrase(
          projectId,
          sectionId,
        );
        setParaphrase(data);
        onListChange(data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [projectId, sectionId, refreshTrigger]);

  const toggelMenu = async (id: string) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const deleteParaphrase = async (id: string) => {
    try {
      setIsLoading(true);
      await paraphraseApi.deleteParaphrase(id);
      setOpenMenu(null);
      const newList = paraphrase.filter((item) => item.id !== id);
      setParaphrase(newList);
      onListChange(newList);
      alert("One Item deleted");
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-layout">
      <div className="paraphrase-header">
        <h3>Paraphrase History</h3>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        paraphrase.map((p, index) => (
          <div key={p.id || index} className="paraphrase-item">
            <div className="paraphrase-content">
              <div className="paraphrase-row main-info">
                <div>
                  <b>Tone:</b> {p.tone?.toLowerCase()}
                </div>
                <div>
                  <b>Length:</b> {p.lengthStrategy?.toLowerCase()}
                </div>
              </div>

              <div className="paraphrase-row sub-info">
                <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                <div>{p.paraphrasedText?.split(" ").length || 0} Words</div>
              </div>
            </div>

            <div className="paraphrase-actions">
              <button
                className="more-options-btn"
                onClick={() => toggelMenu(p.id)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {openMenu === p.id && (
                <div className="dropdown-menu">
                  <div
                    className="menu-item"
                    onClick={() => deleteParaphrase(p.id)}
                  >
                    Delete
                  </div>
                  <div
                    className="menu-item"
                    onClick={() => navigate(`/projects/paraphrase/${p.id}`)}
                  >
                    More Details
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
