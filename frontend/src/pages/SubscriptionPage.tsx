import { useEffect, useState } from "react";
import { RequestedPlans } from "../services/api/subscription";
import { adminApi } from "../services/api/admin";

export function SubscriptionPage() {
  const [requestedPlans, setRequestedPlan] = useState<RequestedPlans[] | []>(
    [],
  );
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [requestIs, setRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await adminApi.getRequestedPlans();
        setRequestedPlan(result);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const handleApproveRequestedPlan = async (userId: string, id: string) => {
    try {
      setRequestId(id);
      await adminApi.approveRequestedPlan(userId, id);
      alert("The Request approved successfully");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error?.message);
    } finally {
      setRequestId(null);
    }
  };
  return (
    <div className="content-layout">
      {isLoading ? (
        <div>Loading...</div>
      ) : requestedPlans.length > 0 ? (
        requestedPlans.map((item, index) => (
          <div key={item.id || index} className="paraphrase-content">
            <div>
              <div>
                <b>Username:</b>
              </div>
              <div>{item.user.fullName}</div>
            </div>

            <div>
              <div>
                <b>User email:</b>
              </div>
              <div>{item.user.email}</div>
            </div>

            <div>
              <div>
                <b>Plan:</b>
              </div>
              <div>{item.subscriptionPlan.name}</div>
            </div>

            <div>
              <div>
                <b>Payment model:</b>
              </div>
              <div>{item.subscriptionPlan.billingModel}</div>
            </div>

            <div>
              <div>
                <b>Credit amount:</b>
              </div>
              <div>{item.subscriptionPlan.includedCredits}</div>
            </div>

            <div>
              <div>
                <b>Cost:</b>
              </div>
              <div>{item.subscriptionPlan.monthlyPriceCents}</div>
            </div>

            <div>
              <div>
                <b>Status:</b>
              </div>
              <div>{item.status}</div>
            </div>

            <div>
              <button
                className="outline-button"
                type="button"
                onClick={() =>
                  handleApproveRequestedPlan(item.user.id, item.id)
                }
              >
                {requestIs === item.id ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="paraphrase-item" style={{ color: "gray" }}>
          No requested plan
        </div>
      )}
    </div>
  );
}
