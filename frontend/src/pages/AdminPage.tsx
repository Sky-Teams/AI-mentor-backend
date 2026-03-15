import { useEffect, useState } from "react";
import { adminApi } from "../services/api/admin";
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

  useEffect(() => {
    const load = async () => {
      const [guidelineData, templateData, planData, userData] = await Promise.all([
        adminApi.getGuidelines(),
        adminApi.getPromptTemplates(),
        adminApi.getPlans(),
        adminApi.getUsersUsage(),
      ]);
      setGuidelines(guidelineData);
      setTemplates(templateData);
      setPlans(planData);
      setUsers(userData);
    };

    void load();
  }, []);

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
              </div>
            ))}
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
                  {plan.monthlyPriceCents ? `$${(plan.monthlyPriceCents / 100).toFixed(2)}` : "No monthly fee"}
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
                  Wallet {user.walletBalance} · Credits billed {user.totalBilledCredits} · Tokens{" "}
                  {user.totalTechnicalTokens}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
