import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./app/providers/AuthProvider";
import { AppLayout } from "./layouts/AppLayout";
import { BillingPage } from "./pages/BillingPage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { JournalPage } from "./pages/JournalPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SectionEditorPage } from "./pages/SectionEditorPage";
import { AdminPage } from "./pages/AdminPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ReferencePage } from "./pages/ReferencePage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
// import { ParaphraseDetails } from "./pages/ParaphraseDetails";

export const App = () => (
  <AuthProvider>
    <Routes>
      <Route element={<Navigate replace to="/dashboard" />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<VerifyEmailPage />} path="/verify-email/:token" />
      <Route element={<ForgotPassword />} path="/forgot-password" />
      <Route element={<ResetPassword />} path="/reset-password/:token" />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<DashboardPage />} path="/dashboard" />
          <Route element={<CreateProjectPage />} path="/projects/new" />
          <Route element={<ProjectDetailsPage />} path="/projects/:projectId" />
          <Route
            element={<SectionEditorPage />}
            path="/projects/:projectId/sections/:sectionKey"
          />
          <Route element={<JournalPage />} path="/journals/new" />
          <Route element={<BillingPage />} path="/billing" />
          <Route element={<AdminPage />} path="/admin" />
          <Route element={<ReferencePage />} path="/references" />
          <Route element={<SubscriptionPage />} path="/admin/subscriptions" />
          {/* <Route
            element={<ParaphraseDetails />}
            path="/projects/paraphrase/:paraphraseRunId"
          /> */}
        </Route>
      </Route>
    </Routes>
  </AuthProvider>
);
