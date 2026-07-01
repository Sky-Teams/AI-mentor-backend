import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Field } from "./Field";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSavedProfile: (fullName: string) => Promise<void>;
}

export function UpdateProfilePane({ isOpen, onClose, onSavedProfile }: Props) {
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  const handleSavedProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onSavedProfile(fullName);

      alert("Your profile updated successfully");
      window.location.reload();
      onClose();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "An error occurred.",
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
          <form className="auth-card" onSubmit={handleSavedProfile}>
            <div>
              <h1>Update Profile</h1>
            </div>

            <Field label="Full Name">
              <input
                name="fullName"
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            <div>
              <button
                type="submit"
                className="primary-button"
                style={{
                  marginTop: "30px",
                  width: "130px",
                  backgroundColor: "#697bdf",
                  padding: "10px 5px",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="submit"
                className="primary-button"
                style={{
                  marginTop: "30px",
                  marginLeft: "10px",
                  width: "130px",
                  backgroundColor: "#ffffff",
                  color: "#697bdf",
                  border: "1px solid #697bdf",
                  padding: "10px 5px",
                }}
                onClick={onClose}
              >
                Cancel Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
