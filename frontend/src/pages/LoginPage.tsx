import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../services/api/auth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [isSendVerifyEmail, setIsSendVerifyEmail] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const emailValue = String(formData.get("email"));
    try {
      await login({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });

      const next =
        (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(next, { replace: true });
    } catch (error: any) {
      setError(
        error?.response?.data?.error?.message ||
          "Login failed. Check the seeded user or your credentials.",
      );
      if (error?.response?.data?.error?.code === "EMAIL_NOT_VERIFIED") {
        setIsVerified(false);
        setEnteredEmail(emailValue);
        setIsSendVerifyEmail(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.resendVerifyEmail(enteredEmail);
      setIsSendVerifyEmail(true);
    } catch (error: any) {
      setError(error?.response?.data?.error?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      {isSendVerifyEmail && (
        <div style={{ color: "green", textAlign: "center" }}>
          <p>Please check your email and verify account.</p>
        </div>
      )}

      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Internal Test UI</p>
          <h1>Sign in</h1>
          <p className="muted-text">
            Use the seeded admin or test user to exercise backend flows.
          </p>
        </div>

        <Field label="Email">
          <input
            name="email"
            placeholder="researcher@example.com"
            required
            type="email"
          />
        </Field>

        <Field label="Password">
          <input
            name="password"
            placeholder="Enter password"
            required
            type="password"
          />
        </Field>

        {error ? <p className="error-text">{error}</p> : null}

        {!isVerified && !isSendVerifyEmail && (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isSubmitting}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            {isSubmitting ? "Sending..." : "Resend Verify Email"}
          </button>
        )}

        <button
          className="primary-button"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="muted-text">
          Need a fresh account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};
