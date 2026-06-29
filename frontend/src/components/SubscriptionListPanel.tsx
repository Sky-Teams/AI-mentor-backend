import { useEffect, useState } from "react";
import {
  RequestedPlans,
  subscriptionApi,
  SubscriptionPlan,
} from "../services/api/subscription";

export function SubscriptionListPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isActivePlan, setIsActivePlan] = useState<boolean>(false);
  const [requestedPlan, setRequestedPlan] = useState<RequestedPlans | null>(
    null,
  );
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plans, requestedPlan, activePlan] = await Promise.all([
          await subscriptionApi.listPlans(),
          await subscriptionApi.getUserRequestedPlan(),
          await subscriptionApi.getActivePlan(),
        ]);

        setPlans(plans);
        setRequestedPlan(requestedPlan);
        if (activePlan) setIsActivePlan(true);
      } catch (error: any) {
        setErrorMessage(
          error.response?.data?.error?.message || "An error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBuyPlan = async (planId: string) => {
    try {
      setSelectedId(planId);
      setErrorMessage("");

      await subscriptionApi.buyPlan(planId);
      const requestedPlan = await subscriptionApi.getUserRequestedPlan();
      setRequestedPlan(requestedPlan);
      alert("The plan was successfully registered.");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "An error occurred",
      );
    } finally {
      setSelectedId(null);
    }
  };

  const handleCancelRequestedPlan = async (requestedId: string) => {
    try {
      setSelectedId(requestedId);
      setErrorMessage("");
      await subscriptionApi.cancelRequestedPlan(requestedId);
      setRequestedPlan(null);
      alert("Your requested cancelled.");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "An error occurred",
      );
    } finally {
      setSelectedId(null);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      setBuyingId(planId);
      setErrorMessage("");
      await subscriptionApi.upgradePlan(planId);
      const requestedPlan = await subscriptionApi.getUserRequestedPlan();
      setRequestedPlan(requestedPlan);
      alert("The plan was successfully registered.");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message || "An error occurred",
      );
    } finally {
      setBuyingId(null);
    }
  };
  return (
    <div>
      {/* List Plans */}
      <div className="content-layout">
        {errorMessage && (
          <div className="error-text" style={{ padding: "20px" }}>
            {errorMessage}
          </div>
        )}
        <div className="paraphrase-header">
          <h2>Plans</h2>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          plans.length > 0 &&
          plans.map((plan, index) => {
            return (
              <div key={plan.id || index}>
                <div
                  className="paraphrase-content"
                  style={{
                    gridTemplateRows: "repeat(1, 1fr)",
                    padding: "20px",
                  }}
                >
                  <div className="paraphrase-row main-info">
                    <div>
                      <b>Payment model</b>
                    </div>
                    <div>
                      <b>{plan.name}</b>
                    </div>
                  </div>

                  <div className="paraphrase-row main-info">
                    <div>
                      <b>Credit amount</b>
                    </div>
                    <div>{plan.includedCredits} credits</div>
                  </div>

                  <div className="paraphrase-row main-info">
                    <div>
                      <b>Cost</b>
                    </div>
                    <div>
                      {plan.monthlyPriceCents
                        ? `$${(plan.monthlyPriceCents / 100).toFixed(2)}`
                        : "No monthly fee"}
                    </div>
                  </div>

                  <div>
                    <button
                      className="outline-button"
                      type="button"
                      onClick={() =>
                        isActivePlan
                          ? handleUpgradePlan(plan.id)
                          : handleBuyPlan(plan.id)
                      }
                    >
                      {isActivePlan
                        ? buyingId === plan.id
                          ? "Upgrading..."
                          : "Upgrade"
                        : buyingId === plan.id
                          ? "Buying..."
                          : "Buy"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Requested Plan */}
        <div className="content-layout" style={{ marginTop: "20px" }}>
          <div className="paraphrase-header">
            <h3>Requested Plan</h3>
          </div>
          {requestedPlan ? (
            <div
              className="paraphrase-content"
              style={{
                gridTemplateRows: "repeat(1, 1fr)",
                gridTemplateColumns: "repeat(5, 1fr)",
                gridGap: "40px",
                padding: "20px",
              }}
            >
              <div className="paraphrase-row main-info">
                <div>
                  <b>Payment model</b>
                </div>
                <div>
                  <b>{requestedPlan.subscriptionPlan.name}</b>
                </div>
              </div>

              <div className="paraphrase-row main-info">
                <div>
                  <b>Credit amount</b>
                </div>
                <div>
                  {requestedPlan.subscriptionPlan.includedCredits} credits
                </div>
              </div>

              <div className="paraphrase-row main-info">
                <div>
                  <b>Cost</b>
                </div>
                <div>
                  {requestedPlan.subscriptionPlan.monthlyPriceCents
                    ? `$${(requestedPlan.subscriptionPlan.monthlyPriceCents / 100).toFixed(2)}`
                    : "No monthly fee"}
                </div>
              </div>

              <div className="paraphrase-row main-info">
                <div>
                  <b>Status</b>
                </div>
                <div>{requestedPlan.status}</div>
              </div>

              <div>
                <button
                  className="outline-button"
                  type="button"
                  onClick={() => handleCancelRequestedPlan(requestedPlan.id)}
                >
                  {selectedId === requestedPlan.id ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: "gray", padding: "20px" }}>
              No Requested Yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
