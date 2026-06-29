import { FormEvent, useState } from "react";
import { Field } from "../components/Field";
import { authApi } from "../services/api/auth";

export function ForgotPassword() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      await authApi.forgotPassword(String(formData.get("email")));
      setIsSubmitted(true);
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
        {isSubmitted && (
          <p className="success-text">
            Please check your email to reset password.
          </p>
        )}
        <div>
          <h1>Forgot Password</h1>
        </div>

        <Field label="Email">
          <input
            name="email"
            placeholder="researcher@example.com"
            required
            type="email"
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
