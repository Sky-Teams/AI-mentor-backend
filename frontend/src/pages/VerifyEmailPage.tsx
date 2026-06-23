import { useEffect, useState } from "react";
import { authApi } from "../services/api/auth";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { setAuthData } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token was not found");
      return;
    }

    const handleVerifyEmail = async () => {
      try {
        const res = await authApi.verifyEmail(token);

        setStatus("success");
        await setAuthData(res.user);
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error?.response?.data?.error?.message);
      }
    };
    handleVerifyEmail();
  }, []);

  if (status === "loading")
    return <div className="auth-shell">Verifying email...</div>;

  if (status === "error")
    return (
      <div style={{ color: "red" }} className="auth-shell">
        <h3>Error verifying email</h3>
        <p>{errorMessage}</p>
      </div>
    );

  return (
    <div style={{ color: "green" }} className="auth-shell">
      Your email has been successfully verified. Redirecting...
    </div>
  );
}
