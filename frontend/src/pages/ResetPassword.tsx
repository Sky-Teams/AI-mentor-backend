import { FormEvent, useState } from "react";
import { Field } from "../components/Field";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../services/api/auth";

export function ResetPassword() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { token } = useParams<{ token: string }>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setErrorMessage("Token was not found");
      return;
    }
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("password");
    const confPassword = formData.get("confPassword");

    if (newPassword !== confPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    try {
      setIsSubmitting(true);
      await authApi.resetPassword(
        token as string,
        String(formData.get("password")),
      );
      navigate("/login", { replace: true });
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "An error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <h1>Reset Password</h1>
        </div>

        <Field label="Enter New Password">
          <input
            name="password"
            placeholder="Minimum 8 characters"
            required
            type="password"
          />
        </Field>

        <Field label="Confirm Password">
          <input
            name="confPassword"
            placeholder="Confirm your password"
            required
            type="password"
          />
        </Field>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
