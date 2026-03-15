import { useEffect, useState } from "react";
import { billingApi } from "../services/api/billing";
import type { BillingOverview } from "../types/api";

export const BillingPage = () => {
  const [overview, setOverview] = useState<BillingOverview | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await billingApi.getOverview();
      setOverview(data);
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Credits and Usage</h1>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-box">
          <span>Balance</span>
          <strong>{overview?.wallet.balance ?? "-"}</strong>
        </div>
        <div className="metric-box">
          <span>Granted</span>
          <strong>{overview?.wallet.lifetimeCreditsGranted ?? "-"}</strong>
        </div>
        <div className="metric-box">
          <span>Consumed</span>
          <strong>{overview?.wallet.lifetimeCreditsConsumed ?? "-"}</strong>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="stack">
            {(overview?.recentTransactions ?? []).map((transaction) => (
              <div className="issue-item" key={transaction.id}>
                <strong>{transaction.amount}</strong>
                <p className="muted-text">
                  {transaction.source} · balance after {transaction.balanceAfter}
                </p>
                <p>{transaction.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent AI Usage</h3>
          </div>
          <div className="stack">
            {(overview?.recentUsage ?? []).map((usage) => (
              <div className="issue-item" key={usage.id}>
                <strong>{usage.model}</strong>
                <p className="muted-text">
                  {usage.status} · {usage.technicalTotalTokens} technical tokens ·{" "}
                  {usage.billedCredits} app credits
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
