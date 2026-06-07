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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await subscriptionApi.listPlans();
        setPlans(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.log(error);
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
      if (error.response?.data?.error?.code === "PLAN_NOT_FOUND") {
        setErrorMessage("Plan was not found");
      } else if (
        error.response?.data?.error?.code === "ALREADY_HAVE_PENDING_REQUEST"
      ) {
        setErrorMessage("Already have a pending request");
      } else {
        setErrorMessage("Please try again...");
      }
      console.log(error);
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
                    onClick={() => handleBuyPlan(plan.id)}
                  >
                    {buyingId === plan.id ? "Buying..." : "Buy Plan"}
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
