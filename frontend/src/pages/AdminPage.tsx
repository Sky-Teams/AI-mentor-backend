import { useEffect, useState } from "react";
import { adminApi } from "../services/api/admin";
import { journalsApi } from "../services/api/journal";
import { Link } from "react-router-dom";
import type {
  AdminUsageUserSummary,
  BillingOverview,
  GuidelinePack,
  PromptTemplate,
} from "../types/api";

type Plan = BillingOverview["plans"][number];

export const AdminPage = () => {
  const [guidelines, setGuidelines] = useState<GuidelinePack[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminUsageUserSummary[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);

  const beginPromptEdit = (template: PromptTemplate) => {
    setEditingPromptId(template.id);
    setPromptDraft(template.customContent ?? "");
    setPromptError("");
    setSavedPromptId(null);
  };

  const savePrompt = async (
    template: PromptTemplate,
    customContent: string | null = promptDraft,
  ) => {
    setSavingPrompt(true);
    setPromptError("");
    try {
      const updated = await adminApi.updatePromptTemplateCustomContent(
        template.id,
        customContent,
      );
      setTemplates((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setPromptDraft(updated.customContent ?? "");
      setSavedPromptId(template.id);
      setEditingPromptId(null);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Could not save additional instructions. Please try again.";
      setPromptError(message);
    } finally {
      setSavingPrompt(false);
    }
  };

  useEffect(() => {
    if (!editingPromptId) return;
    document.body.classList.add("active-modal");
    return () => document.body.classList.remove("active-modal");
  }, [editingPromptId]);

  useEffect(() => {
    if (!savedPromptId) return;
    const timeout = window.setTimeout(() => setSavedPromptId(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [savedPromptId]);

  useEffect(() => {
    const load = async () => {
      const [guidelineData, templateData, planData, userData] =
        await Promise.all([
          adminApi.getGuidelines(),
          adminApi.getPromptTemplates(),
          adminApi.getPlans(),
          adminApi.getUsersUsage(),
        ]);
      setGuidelines(guidelineData);
      setTemplates(templateData);
      setPlans(planData);
      setUsers(userData);

      try {
        const list = await journalsApi.list();
        setJournals(list);
      } catch (e) {
        // ignore if API not available
      }
    };

    void load();
  }, []);

  const editingTemplate = templates.find(
    (template) => template.id === editingPromptId,
  );

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Configuration Overview</h1>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="card">
          <h3>Guideline Packs</h3>
          <div className="stack">
            {guidelines.map((item) => (
              <div className="issue-item" key={item.id}>
                <strong>{item.name}</strong>
                <p className="muted-text">
                  {item.code} · {item.version} · {item.status}
                  {item.isDefault ? " · default" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Prompt Templates</h3>
          <div className="stack">
            {templates.map((template) => (
              <div className="issue-item" key={template.id}>
                <strong>{template.name}</strong>
                <p className="muted-text">
                  {template.code} · v{template.version} · {template.status}
                </p>
                {template.type === "SECTION_REVIEW" ||
                template.type === "SECTION_PARAPHRASE" ? (
                  <div className="prompt-template-actions">
                    {savedPromptId === template.id && (
                      <span className="success-text" role="status">
                        Saved
                      </span>
                    )}
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => beginPromptEdit(template)}
                    >
                      Edit prompt
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="card">
          <h3>Journals</h3>
          <div className="stack">
            {journals.length === 0 ? (
              <p className="muted-text">No journals found.</p>
            ) : (
              journals.map((j) => (
                <div className="issue-item" key={j.id}>
                  <strong>{j.name}</strong>
                  <p className="muted-text">{j.publisher}</p>
                  <Link to={`/journals/${j.id}/edit`} className="muted-text">
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="card">
          <h3>Plans</h3>
          <div className="stack">
            {plans.map((plan) => (
              <div className="issue-item" key={plan.id}>
                <strong>{plan.name}</strong>
                <p className="muted-text">
                  {plan.billingModel} · {plan.includedCredits} credits ·{" "}
                  {plan.monthlyPriceCents
                    ? `$${(plan.monthlyPriceCents / 100).toFixed(2)}`
                    : "No monthly fee"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>User Usage</h3>
          <div className="stack">
            {users.map((user) => (
              <div className="issue-item" key={user.id}>
                <strong>{user.fullName}</strong>
                <p className="muted-text">
                  {user.email} · {user.role}
                </p>
                <p className="muted-text">
                  Wallet {user.walletBalance} · Credits billed{" "}
                  {user.totalBilledCredits} · Tokens {user.totalTechnicalTokens}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingTemplate && (
        <div className="prompt-edit-modal-backdrop">
          <section
            className="prompt-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-edit-title"
          >
            <div className="prompt-edit-modal-header">
              <div>
                <h2 id="prompt-edit-title">Edit prompt instructions</h2>
                <p className="muted-text">{editingTemplate.name}</p>
              </div>
            </div>

            <label className="field">
              <span>Original prompt</span>
              <textarea
                rows={10}
                value={editingTemplate.templateText}
                readOnly
                style={{ background: "#f1f1f1", color: "#777" }}
              />
            </label>
            <label className="field">
              <span>Additional instructions</span>
              <textarea
                rows={7}
                maxLength={4000}
                value={promptDraft}
                autoFocus
                onChange={(event) => setPromptDraft(event.target.value)}
              />
              <span className="muted-text">
                {promptDraft.trim()
                  ? promptDraft.trim().split(/\s+/).length
                  : 0}{" "}
                words
              </span>
            </label>
            {promptError && (
              <p role="alert" className="error-text">
                {promptError}
              </p>
            )}
            <div className="button-row prompt-edit-modal-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={savingPrompt}
                onClick={() => setEditingPromptId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={
                  savingPrompt ||
                  promptDraft.length > 4000 ||
                  promptDraft === (editingTemplate.customContent ?? "")
                }
                onClick={() => void savePrompt(editingTemplate)}
              >
                {savingPrompt ? "Saving..." : "Save"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
