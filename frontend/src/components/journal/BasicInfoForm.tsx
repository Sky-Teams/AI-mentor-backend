import type { JournalFormState } from "../../utils/journalForm";
import type { Specialty } from "../../types/api";

type BasicInfoFormProps = {
  form: JournalFormState;
  isLoadingSpecialties: boolean;
  onChange: (
    field: keyof Omit<JournalFormState, "sections">,
    value: string,
  ) => void;
  specialties: Specialty[];
};

export const BasicInfoForm = ({
  form,
  isLoadingSpecialties,
  onChange,
  specialties,
}: BasicInfoFormProps) => (
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
          required
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

      <label className="field">
        <span>Specialty</span>
        <select
          disabled={isLoadingSpecialties || specialties.length === 0}
          onChange={(event) => onChange("specialtyId", event.target.value)}
          required
          value={form.specialtyId}
        >
          <option value="">
            {isLoadingSpecialties
              ? "Loading specialties..."
              : "Choose specialty"}
          </option>
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
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
        required
        rows={4}
        value={form.guidelinePack}
      />
    </label>
  </section>
);
