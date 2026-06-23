import { useEffect, useState } from "react";
import {
  subscriptionApi,
  SubscriptionPlan,
} from "../services/api/subscription";

export function SubscriptionListPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isActivePlan, setIsActivePlan] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plans, activePlan] = await Promise.all([
          await subscriptionApi.listPlans(),
          await subscriptionApi.getActivePlan(),
        ]);

        setPlans(plans);
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
      setBuyingId(planId);
      setErrorMessage("");

      await subscriptionApi.buyPlan(planId);
      alert("The plan was successfully registered.");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message || "An error occurred",
      );
    } finally {
      setBuyingId(null);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      setBuyingId(planId);
      setErrorMessage("");
      await subscriptionApi.upgradePlan(planId);
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
    <div className="content-layout">
      {errorMessage && <div className="error-text">{errorMessage}</div>}
      <div className="paraphrase-header">
        <h2>Plans</h2>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        plans.length > 0 &&
        plans.map((plan, index) => {
          return (
            <div key={plan.id || index} className="paraphrase-item">
              <div className="paraphrase-content">
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
    </div>
  );
}
