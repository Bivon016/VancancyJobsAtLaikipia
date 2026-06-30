import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import {
  AdminRoute,
  ApplicantRoute,
  GuestRoute,
  ProtectedRoute,
} from "./auth/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import ApplicantLayout from "./components/layout/ApplicantLayout";
import AdminLayout from "./components/layout/AdminLayout";
import LandingPage from "./pages/public/LandingPage";
import VacancyListPage from "./pages/public/VacancyListPage";
import VacancyDetailPage from "./pages/public/VacancyDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import ApplicantDashboard from "./pages/applicant/DashboardPage";
import ProfilePage from "./pages/applicant/ProfilePage";
import DocumentsPage from "./pages/applicant/DocumentsPage";
import ApplicationsPage from "./pages/applicant/ApplicationsPage";
import NotificationsPage from "./pages/applicant/NotificationsPage";
import ApplyVacancyPage from "./pages/applicant/ApplyVacancyPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import RecruitmentPage from "./pages/admin/RecruitmentPage";
import VacanciesPage from "./pages/admin/VacanciesPage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import ShortlistsPage from "./pages/admin/ShortlistsPage";
import InterviewsPage from "./pages/admin/InterviewsPage";
import SelectionsPage from "./pages/admin/SelectionsPage";
import InterviewSetupPage from "./pages/admin/InterviewSetupPage";
import PanelInterviewsPage from "./pages/panel/PanelInterviewsPage";
import VacancyQuestionsPage from "./pages/panel/VacancyQuestionsPage";
import { Interviewexamsystem } from "./pages/applicant/Interviewexamsystem";
import { ROLES } from "./utils/roles";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="vacancies" element={<VacancyListPage />} />
            <Route path="vacancies/:id" element={<VacancyDetailPage />} />
            <Route
              path="login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="access-denied" element={<AccessDeniedPage />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={[ROLES.APPLICANT]}>
                <ApplicantRoute>
                  <ApplicantLayout />
                </ApplicantRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<ApplicantDashboard />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={[ROLES.APPLICANT]}>
                <ApplicantRoute>
                  <ApplicantLayout />
                </ApplicantRoute>
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<ProfilePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="vacancies/:id/apply" element={<ApplyVacancyPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                roles={[
                  ROLES.SUPER_ADMIN,
                  ROLES.CPSB_ADMIN,
                  ROLES.DEPT_HEAD,
                  ROLES.HR_OFFICER,
                  ROLES.PANEL_MEMBER,
                ]}
              >
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments"
              element={
                <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment"
              element={
                <ProtectedRoute
                  roles={[ROLES.SUPER_ADMIN, ROLES.CPSB_ADMIN, ROLES.DEPT_HEAD]}
                >
                  <RecruitmentPage />
                </ProtectedRoute>
              }
            />
            {/* <Route
  path="interviews/:interviewId/questions"
  element={
    <ProtectedRoute
      roles={[
        ROLES.SUPER_ADMIN,
        ROLES.HR_OFFICER,
        ROLES.CPSB_ADMIN,
        ROLES.PANEL_MEMBER,
      ]}
    >
      <InterviewExamSystem />
    </ProtectedRoute>
  }
/> */}
            <Route
              path="vacancies"
              element={
                <ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.CPSB_ADMIN]}>
                  <VacanciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute
                  roles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.HR_OFFICER,
                    ROLES.CPSB_ADMIN,
                  ]}
                >
                  <AdminApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="shortlists"
              element={
                <ProtectedRoute
                  roles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.HR_OFFICER,
                    ROLES.CPSB_ADMIN,
                  ]}
                >
                  <ShortlistsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="interviews"
              element={
                <ProtectedRoute
                  roles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.HR_OFFICER,
                    ROLES.CPSB_ADMIN,
                    ROLES.PANEL_MEMBER,
                  ]}
                >
                  <InterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="interview-setup"
              element={
                <ProtectedRoute
                  roles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.HR_OFFICER,
                  ]}
                >
                  <InterviewSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="panel/my-interviews"
              element={
                <ProtectedRoute
                  roles={[ROLES.PANEL_MEMBER]}
                >
                  <PanelInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="panel/vacancy-questions"
              element={
                <ProtectedRoute
                  roles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.HR_OFFICER,
                    ROLES.PANEL_MEMBER,
                  ]}
                >
                  <VacancyQuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="selections"
              element={
                <ProtectedRoute
                  roles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.CPSB_ADMIN,
                    ROLES.HR_OFFICER,
                  ]}
                >
                  <SelectionsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/interview/:interviewId/:view"
            element={
              <ProtectedRoute
                roles={[
                  ROLES.APPLICANT,
                  ROLES.PANEL_MEMBER,
                  ROLES.SUPER_ADMIN,
                  ROLES.HR_OFFICER,
                ]}
              >
                <Interviewexamsystem />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
