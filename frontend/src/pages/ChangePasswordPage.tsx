import { FormEvent, useState } from "react";
import { Field } from "../components/Field";
import { userApi } from "../services/api/user";

export function ChangePasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword");
    const confPassword = formData.get("confPassword");

    if (newPassword !== confPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    try {
      setIsSubmitting(true);
      await userApi.changePassword(
        String(formData.get("currentPassword")),
        String(formData.get("newPassword")),
      );
      setMessage("Your password changed successfully");
    } catch (error: any) {
      setMessage("");
      setErrorMessage(
        error.response?.data?.error?.message || "An error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <h1>Change password</h1>
        </div>

        {message && <p className="success-text">{message}</p>}
        <Field label="Current Password">
          <input
            name="currentPassword"
            placeholder="Minimum 8 characters"
            required
            type="password"
          />
        </Field>

        <Field label="New Password">
          <input
            name="newPassword"
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

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        <button
          className="primary-button"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Changing..." : "Change"}
        </button>
      </form>
    </div>
  );
}
