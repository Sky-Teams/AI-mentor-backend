import { useEffect, useState } from "react";
import {
  subscriptionApi,
  SubscriptionPlan,
} from "../services/api/subscription";

export function SubscriptionListPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

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
      await subscriptionApi.buyPlan(planId);
      alert("The plan was successfully registered.");
    } catch (error: any) {
      const errorMessage = error || "Something went wrong";
      alert(errorMessage);
      console.log(error);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="content-layout">
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
