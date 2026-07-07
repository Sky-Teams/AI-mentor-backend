import { FormEvent, useState } from "react";
import { Field } from "./Field";
import { userApi } from "../services/api/user";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordPanel({ isOpen, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      alert("Your password changed successfully");
      onClose();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error?.message || "An error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="modal-reference" onClick={onClose}>
        <div
          style={{
            minWidth: "500px",
            backgroundColor: "white",
            padding: "30px 50px",
            borderRadius: "5px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <form className="auth-card" onSubmit={handleSubmit}>
            <div>
              <h1>Change password</h1>
            </div>

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
              style={{ width: "130px" }}
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
