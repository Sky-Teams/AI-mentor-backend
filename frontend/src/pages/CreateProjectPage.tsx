import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { projectsApi } from "../services/api/projects";
import { journalsApi } from "../services/api/journal";

interface ArticleType {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

interface Journal {
  id: string;
  name: string;
}

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);

  const [articleTypesLoading, setArticleTypesLoading] = useState(true);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
  const [journalsLoading, setJournalsLoading] = useState(false);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedSpecialtyHasJournals, setSelectedSpecialtyHasJournals] =
    useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [types, specs] = await Promise.all([
          projectsApi.getArticleTypes(),
          projectsApi.getSpecialties(),
        ]);
        setArticleTypes(types);
        setSpecialties(specs);
      } catch (err: any) {
        console.log(err?.message ?? err);
      } finally {
        setArticleTypesLoading(false);
        setSpecialtiesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedSpecialty) {
      setJournals([]);
      setSelectedSpecialtyHasJournals(false);
      return;
    }

    const loadJournals = async () => {
      setJournalsLoading(true);
      try {
        const data = await journalsApi.listBySpecialty(selectedSpecialty);
        setJournals(data);
        setSelectedSpecialtyHasJournals(data.length > 0);
      } catch (err: any) {
        console.log(err?.message ?? err);
        setJournals([]);
        setSelectedSpecialtyHasJournals(false);
      } finally {
        setJournalsLoading(false);
      }
    };

    loadJournals();
  }, [selectedSpecialty]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(event.currentTarget);
    const articleTypeId = String(formData.get("articleTypeId"));
    const specialtyId = String(formData.get("specialtyId"));
    const targetJournal = String(formData.get("targetJournal"));
    const title = String(formData.get("title"));

    try {
      const project = await projectsApi.create({
        title,
        articleTypeId,
        specialtyId,
        targetJournal,
      });

      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error?.details[0].field ??
        err?.message ??
        "An unexpected error occurred.";
      setSubmitError("validation error: " + backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Create</p>
          <h1>New Case Report Project</h1>
        </div>
      </div>

      <form className="card stack" onSubmit={handleSubmit}>
        <Field label="Article Type">
          <select name="articleTypeId" required disabled={articleTypesLoading}>
            <option value="" disabled>
              {articleTypesLoading
                ? "Loading article types..."
                : "Select an article type"}
            </option>
            {articleTypes.map((at) => {
              const isActive = at.status === "ACTIVE";
              return (
                <option key={at.id} value={at.id} disabled={!isActive}>
                  {isActive ? "\u2705" : "\u26AA"} {at.name}
                  {at.description ? ` — ${at.description}` : ""}
                </option>
              );
            })}
          </select>
        </Field>

        <Field label="Specialty">
          <select
            name="specialtyId"
            required
            disabled={specialtiesLoading}
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="" disabled>
              {specialtiesLoading
                ? "Loading specialties..."
                : "Select a specialty"}
            </option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.description ? ` — ${s.description}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Target Journal">
          <select
            name="targetJournal"
            required
            disabled={
              !selectedSpecialty ||
              journalsLoading ||
              !selectedSpecialtyHasJournals
            }
          >
            <option value="" disabled>
              {!selectedSpecialty
                ? "Select a specialty first"
                : journalsLoading
                  ? "Loading journals..."
                  : !selectedSpecialtyHasJournals
                    ? "This specialty does not have any journal"
                    : "Select a journal"}
            </option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
                {j.description ? ` — ${j.description}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Project Title">
          <input
            name="title"
            placeholder="Rare cardiac presentation with..."
            required
            type="text"
          />
        </Field>

        {submitError && (
          <div
            className="error-message"
            style={{
              color: "#d32f2f",
              backgroundColor: "#fdecea",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              border: "1px solid #f5c6cb",
              fontSize: "0.9rem",
            }}
          >
            {submitError}
          </div>
        )}

        <button
          className="primary-button"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create project"}
        </button>
      </form>
    </div>
  );
};
