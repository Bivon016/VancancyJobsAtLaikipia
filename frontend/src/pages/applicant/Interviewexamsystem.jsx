import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PanelQuestionComposer from "../../components/interview/PanelQuestionComposer";
import ApplicantExamSession from "../../components/interview/ApplicantExamSession";
import InterviewTranscriptView from "../../components/interview/InterviewTranscriptView";
import { PageShell, CenteredNotice } from "../../utils/designSystem.jsx";
import { AlertTriangle } from "lucide-react";

/**
 * Interviewexamsystem - Main router for interview Q&A and exam features.
 * Supports three flows:
 * 1. PANEL_MEMBER — Creates questions, views transcript
 * 2. APPLICANT — Takes timed exam, answers questions
 * 3. SUPER_ADMIN/HR_OFFICER — Read-only oversight of transcript
 */
export function Interviewexamsystem() {
  const { user } = useAuth();
  const { interviewId, view } = useParams();
  const navigate = useNavigate();

  // Mock interview object - replace with API call as needed
  const interview = {
    id: parseInt(interviewId) || 1,
    vacancyTitle: "Senior Revenue Officer",
    department: "Department of Finance & Economic Planning",
    applicantName: "Wanjiru Kamau",
    durationMinutes: 60,
    status: "SCHEDULED",
    examStartedAt: null,
    deadline: null,
  };

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];
  const isPanelMember = userRoles.includes("PANEL_MEMBER");
  const isApplicant = userRoles.includes("APPLICANT");
  const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("HR_OFFICER");

  // Role-gating: ensure user has appropriate access
  if (!isPanelMember && !isApplicant && !isAdmin) {
    return (
      <PageShell eyebrow="Interview" title="Access Denied">
        <CenteredNotice
          icon={
            <div
              style={{
                width: 56,
                height: 56,
                background: "rgba(179,73,31,0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={28} color="#B3491F" />
            </div>
          }
          title="Unauthorized"
          body="You do not have permission to access this interview. Contact your administrator."
        />
      </PageShell>
    );
  }

  // Route: PANEL_MEMBER views
  if (isPanelMember && (view === "composer" || !view)) {
    return <PanelQuestionComposer interviewId={interview.id} />;
  }

  if ((isPanelMember || isAdmin) && view === "transcript") {
    return <InterviewTranscriptView interview={interview} />;
  }

  // Route: APPLICANT exam session
  if (isApplicant && view === "exam") {
    return (
      <ApplicantExamSession
        interview={interview}
        onComplete={() => navigate("/applicant/interviews")}
      />
    );
  }

  // Route: ADMIN read-only transcript
  if (isAdmin && view === "transcript") {
    return <InterviewTranscriptView interview={interview} />;
  }

  // Default: show error if view not found
return (
  <PageShell eyebrow="Interview" title="Page Not Found">
    <CenteredNotice
      icon={
        <div
          style={{
            width: 56,
            height: 56,
            background: "rgba(179,73,31,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={28} color="#B3491F" />
        </div>
      }
      title="Page Not Found"
      body={`The view "${view}" is not available for your role.`}
    />
  </PageShell>
);
}
