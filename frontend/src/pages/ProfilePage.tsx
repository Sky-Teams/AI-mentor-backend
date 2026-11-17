import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UpdateProfilePane } from "../components/UpdateProfilePanel";
import { User, userApi } from "../services/api/user";
import { ChangePasswordPanel } from "../components/ChangePasswordPanel";
import { useNavigate } from "react-router-dom";
import { normalizeApiError } from "../utils/normalizeApiError";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
  const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [updateProfile, setUpdateProfile] = useState<User>();

  const handleUpdateProfile = async (fullName: string) => {
    try {
      setErrorMessage("");
      const result = await userApi.updateProfile(fullName);
      setUpdateProfile(result);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Permanently delete your account and its associated data? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeleteError("");
    setIsDeletingAccount(true);
    try {
      await userApi.deleteAccount();
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card">
        <div className="card-header">
          <h3>Personal Information</h3>
          <div>
            <button
              className="primary-button"
              style={{ backgroundColor: "#6ab9ee", marginRight: "5px" }}
              onClick={() => setIsOpenUpdateModal(true)}
            >
              Update profile
            </button>
            <button
              className="primary-button"
              onClick={() => setIsOpenChangePasswordModal(true)}
            >
              Change password
            </button>
          </div>
        </div>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {/* Profile details */}
        <div>
          <div style={{ borderBottom: "1px solid #cacaca" }}>
            <h5>Full Name</h5>
            <span>{user?.fullName}</span>
          </div>
          <div
            style={{ borderBottom: "1px solid #cacaca", marginBottom: "20px" }}
          >
            <h5>Email</h5>
            <span>{user?.email}</span>
          </div>
        </div>

        {/* Modal for update profile */}
        {isOpenUpdateModal && (
          <UpdateProfilePane
            isOpen={isOpenUpdateModal}
            onClose={() => setIsOpenUpdateModal(false)}
            onSavedProfile={(data) => handleUpdateProfile(data)}
          />
        )}

        {/* Modal for change password */}
        {isOpenChangePasswordModal && (
          <ChangePasswordPanel
            isOpen={isOpenChangePasswordModal}
            onClose={() => setIsOpenChangePasswordModal(false)}
          />
        )}
      </div>

      <div className="card danger-zone">
        <h3>Delete account</h3>
        <p>
          Permanently delete your account and associated data. This action
          cannot be undone.
        </p>
        {deleteError && (
          <p className="error-text" role="alert">
            {deleteError}
          </p>
        )}
        <button
          className="danger-button"
          disabled={isDeletingAccount}
          onClick={handleDeleteAccount}
          type="button"
        >
          {isDeletingAccount ? "Deleting account..." : "Delete account"}
        </button>
      </div>
    </div>
  );
}
