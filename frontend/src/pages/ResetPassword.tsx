import { FormEvent, useEffect, useState } from "react";
import { Field } from "../components/Field";
import { useParams } from "react-router-dom";
import { authApi } from "../services/api/auth";

export function ResetPassword() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { token } = useParams<{ token: string }>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setErrorMessage("Token was not found");
      return;
    }
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    try {
      setIsSubmitting(true);
      await authApi.resetPassword(
        token as string,
        String(formData.get("password")),
      );
      setIsSubmitted(true);
    } catch (error: any) {
      setIsSubmitted(false);
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

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        {isSubmitted && (
          <p className="success-text">Your password updated successfully.</p>
        )}
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
