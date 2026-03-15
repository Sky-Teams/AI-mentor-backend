import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { projectsApi } from "../services/api/projects";

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const project = await projectsApi.create({
      title: String(formData.get("title")),
      targetJournal: String(formData.get("targetJournal") || ""),
      metadata: {
        specialty: String(formData.get("specialty") || ""),
        patientAge: String(formData.get("patientAge") || ""),
        patientSex: String(formData.get("patientSex") || ""),
        country: String(formData.get("country") || ""),
        institution: String(formData.get("institution") || ""),
        articleGoals: String(formData.get("articleGoals") || ""),
      },
    });

    navigate(`/projects/${project.id}`);
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
        <Field label="Project title">
          <input name="title" placeholder="Rare cardiac presentation with..." required type="text" />
        </Field>

        <Field label="Target journal">
          <input name="targetJournal" placeholder="BMJ Case Reports" type="text" />
        </Field>

        <div className="form-grid">
          <Field label="Specialty">
            <input name="specialty" placeholder="Cardiology" type="text" />
          </Field>
          <Field label="Patient age">
            <input name="patientAge" placeholder="42 years" type="text" />
          </Field>
          <Field label="Patient sex">
            <input name="patientSex" placeholder="Female" type="text" />
          </Field>
          <Field label="Country">
            <input name="country" placeholder="United States" type="text" />
          </Field>
        </div>

        <Field label="Institution">
          <input name="institution" placeholder="University Hospital" type="text" />
        </Field>

        <Field label="Article goals">
          <textarea
            name="articleGoals"
            placeholder="Why this case matters for publication"
            rows={4}
          />
        </Field>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create project"}
        </button>
      </form>
    </div>
  );
};
