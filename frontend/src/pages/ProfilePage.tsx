import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UpdateProfilePane } from "../components/UpdateProfilePanel";
import { User, userApi } from "../services/api/user";
import { ChangePasswordPanel } from "../components/ChangePasswordPanel";

export function ProfilePage() {
  const { user } = useAuth();
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
  const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updateProfile, setUpdateProfile] = useState<User>();

  const handleUpdateProfile = async (fullName: string) => {
    try {
      setErrorMessage("");
      const result = await userApi.updateProfile(fullName);
      setUpdateProfile(result);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error?.message || "An error occurred.",
      );
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
    </div>
  );
}
