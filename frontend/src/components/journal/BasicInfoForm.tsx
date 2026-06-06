import type { JournalFormState } from "../../utils/journalForm";

type BasicInfoFormProps = {
  form: JournalFormState;
  onChange: (field: keyof Omit<JournalFormState, "sections">, value: string) => void;
};

export const BasicInfoForm = ({ form, onChange }: BasicInfoFormProps) => (
  <section className="card journal-card">
    <div className="card-header">
      <div>
        <h3>Basic Info</h3>
        <p className="muted-text">Name, publisher, and core guideline text.</p>
      </div>
    </div>

    <div className="form-grid">
      <label className="field">
        <span>Journal Name</span>
        <input
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="Daily Reflection Journal"
          value={form.name}
        />
      </label>

      <label className="field">
        <span>Publisher</span>
        <input
          onChange={(event) => onChange("publisher", event.target.value)}
          placeholder="AI Mentor"
          value={form.publisher}
        />
      </label>
    </div>

    <label className="field">
      <span>Description</span>
      <textarea
        onChange={(event) => onChange("description", event.target.value)}
        placeholder="Short description for admins and users."
        rows={3}
        value={form.description}
      />
    </label>

    <label className="field">
      <span>Guideline Pack</span>
      <textarea
        onChange={(event) => onChange("guidelinePack", event.target.value)}
        placeholder="Write the main rules or guidance this journal should use."
        rows={4}
        value={form.guidelinePack}
      />
    </label>
  </section>
);
