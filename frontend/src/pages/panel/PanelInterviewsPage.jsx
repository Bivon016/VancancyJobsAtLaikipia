import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  palette,
  fontDisplay,
  fontBody,
  fontMono,
  PageShell,
  Stamp,
  statusTone,
  Spinner,
  CenteredNotice,
} from "../../utils/designSystem.jsx";
import { interviewsApi } from "../../api";
import { Clock, Plus, ChevronRight, AlertCircle } from "lucide-react";

/**
 * PanelInterviewsPage - Panel members view their assigned interviews
 * and add questions to prepare for the online exam.
 */
export function PanelInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewsApi.getMy();
      setInterviews(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your interviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Panel Member"
      title="My Interviews"
      subtitle="Manage questions for online exams to help shortlist candidates"
    >
      <div style={{ maxWidth: 1040, margin: "0 auto", marginTop: 24 }}>
        {error && (
          <div
            style={{
              background: "rgba(179,73,31,0.12)",
              border: `1px solid ${palette.red}55`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 20,
              display: "flex",
              gap: 8,
              fontSize: 13.5,
              color: palette.parchment,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spinner />
            <p style={{ color: palette.slate, marginTop: 12 }}>Loading your interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <CenteredNotice
            icon={
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "rgba(201,162,75,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock size={28} color={palette.gold} />
              </div>
            }
            title="No Interviews Assigned"
            body="You don't have any interviews assigned yet. Contact your HR officer to get started."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onViewComposer={() =>
                  navigate(`/interview/${interview.id}/composer`)
                }
                onViewTranscript={() =>
                  navigate(`/interview/${interview.id}/transcript`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function InterviewCard({ interview, onViewComposer, onViewTranscript }) {
  const getStatusColor = (status) => {
    const statusMap = {
      SCHEDULED: palette.gold,
      IN_PROGRESS: palette.gold,
      COMPLETED: palette.green,
      EXPIRED: palette.red,
    };
    return statusMap[status] || palette.slate;
  };

  return (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${palette.hairline}`,
        borderRadius: 8,
        padding: 20,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 20,
        alignItems: "start",
      }}
    >
      {/* Left: Interview Details */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h3
            style={{
              fontFamily: fontDisplay,
              fontSize: 18,
              fontWeight: 600,
              color: palette.parchment,
              margin: 0,
            }}
          >
            {interview.application?.vacancy?.title || "Untitled Interview"}
          </h3>
          <Stamp tone={statusTone(interview.status)}>{interview.status}</Stamp>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Candidate */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: palette.gold,
                marginBottom: 4,
              }}
            >
              Candidate
            </span>
            <p style={{ margin: 0, fontSize: 13.5, color: palette.parchment }}>
              {interview.application?.applicant?.user?.firstName}{" "}
              {interview.application?.applicant?.user?.lastName}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: palette.slate,
              }}
            >
              {interview.application?.applicant?.user?.email}
            </p>
          </div>

          {/* Date & Time */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: palette.gold,
                marginBottom: 4,
              }}
            >
              Scheduled Date & Time
            </span>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: palette.parchment,
                fontFamily: fontMono,
              }}
            >
              {interview.interviewDate || "—"} @ {interview.interviewTime || "—"}
            </p>
          </div>

          {/* Venue */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: palette.gold,
                marginBottom: 4,
              }}
            >
              Venue
            </span>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: palette.parchment,
              }}
            >
              {interview.venue || "TBD"}
            </p>
          </div>

          {/* Duration */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: palette.gold,
                marginBottom: 4,
              }}
            >
              Exam Duration
            </span>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: palette.parchment,
                fontFamily: fontMono,
              }}
            >
              {interview.durationMinutes ? `${interview.durationMinutes} min` : "—"}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: palette.slate, lineHeight: 1.6, margin: 0 }}>
          {interview.application?.vacancy?.department?.departmentName || "Department"}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <button
          onClick={onViewComposer}
          style={{
            padding: "10px 16px",
            background: palette.gold,
            color: palette.ink,
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus size={16} /> Questions
        </button>

        {interview.status === "COMPLETED" && (
          <button
            onClick={onViewTranscript}
            style={{
              padding: "10px 16px",
              background: palette.raised,
              color: palette.parchment,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <ChevronRight size={16} /> Results
          </button>
        )}
      </div>
    </div>
  );
}

export default PanelInterviewsPage;
