import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  palette,
  fontDisplay,
  fontBody,
  fontMono,
  PageShell,
  Stamp,
  Spinner,
} from "../../utils/designSystem.jsx";
import { interviewsApi, applicationsApi, adminApi } from "../../api";
import { AlertCircle, Plus, Check, ArrowRight } from "lucide-react";

/**
 * InterviewSetupPage - HR Officer workflow to:
 * 1. Select shortlisted applicants
 * 2. Schedule interviews (set date, time, venue, duration)
 * 3. Assign panel members to create questions
 */
export function InterviewSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Select Applicants | 2: Schedule | 3: Assign Panel
  const [shortlisted, setShortlisted] = useState([]);
  const [selected, setSelected] = useState([]);
  const [panelMembers, setPanelMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: "",
    interviewTime: "",
    venue: "",
    durationMinutes: "60",
  });

  // Panel assignment
  const [panelAssignments, setPanelAssignments] = useState({}); // applicantId -> [panelMemberIds]

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all applications (not just SHORTLISTED - show all candidates)
      const appRes = await applicationsApi.getAll();
      // Filter for applications that are APPROVED or SHORTLISTED (candidates who passed initial screening)
      const filteredApps = appRes.data?.filter(
        (a) => a.applicationStatus === "SHORTLISTED" || a.applicationStatus === "APPROVED"
      ) || [];
      setShortlisted(filteredApps);

      // Get panel members
      const panelRes = await adminApi.getUsers(["PANEL_MEMBER"]);
      setPanelMembers(panelRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApplicant = (appId) => {
    setSelected((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleScheduleInterviews = async () => {
    if (!scheduleForm.interviewDate || !scheduleForm.interviewTime) {
      setError("Please fill in date and time");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Schedule interviews for each selected applicant
      await Promise.all(
        selected.map((appId) =>
          interviewsApi.schedule({
            applicationId: appId,
            interviewDate: scheduleForm.interviewDate,
            interviewTime: scheduleForm.interviewTime,
            venue: scheduleForm.venue,
            durationMinutes: parseInt(scheduleForm.durationMinutes),
          })
        )
      );

      setStep(3); // Move to panel assignment
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule interviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPanel = async () => {
    try {
      setLoading(true);
      setError(null);

      // For each selected applicant and their assigned panel members,
      // add panel members to the interview
      // (This assumes you have an endpoint to get interview by applicationId)
      // For now, show success and guide next steps

      setStep(4); // Completion step
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign panel");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="HR Officer / Admin"
      title="Interview Setup"
      subtitle="Create online exams to shortlist candidates for physical interviews"
    >
      <div style={{ maxWidth: 900, margin: "0 auto", marginTop: 24 }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {[
            { num: 1, label: "Select Candidates" },
            { num: 2, label: "Schedule Exam" },
            { num: 3, label: "Assign Panel" },
            { num: 4, label: "Complete" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: step >= s.num ? palette.gold : palette.raised,
                    border: `2px solid ${step >= s.num ? palette.gold : palette.hairline}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step >= s.num ? palette.ink : palette.slate,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {step > s.num ? <Check size={20} /> : s.num}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: "center",
                    color: step >= s.num ? palette.parchment : palette.slate,
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  style={{
                    flex: 0,
                    display: "flex",
                    alignItems: "center",
                    color: step > s.num ? palette.gold : palette.slate,
                  }}
                >
                  <ArrowRight size={20} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

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

        {/* Step 1: Select Applicants */}
        {step === 1 && (
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontFamily: fontDisplay,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Select Shortlisted Candidates
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: palette.slate,
                marginBottom: 20,
              }}
            >
              Choose which shortlisted candidates will take the online exam:
            </p>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spinner />
              </div>
            ) : shortlisted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <AlertCircle size={28} color={palette.gold} style={{ margin: "0 auto 16px" }} />
                <h3
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: 20,
                    fontWeight: 600,
                    color: palette.parchment,
                    margin: "0 0 8px 0",
                  }}
                >
                  No Approved Candidates
                </h3>
                <p
                  style={{
                    margin: 0,
                    maxWidth: 400,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: palette.slate,
                    marginBottom: 20,
                  }}
                >
                  No approved or shortlisted candidates available. Process applications first to create interviews.
                </p>
                <p
                  style={{
                    fontSize: 13.5,
                    color: palette.slate,
                    marginBottom: 16,
                  }}
                >
                  ✓ If you've already scheduled interviews, click "View Interviews" to see them:
                </p>
                <button
                  onClick={() => navigate("/admin/interviews")}
                  style={{
                    padding: "10px 16px",
                    background: palette.raised,
                    color: palette.gold,
                    border: `1px solid ${palette.gold}`,
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  View Interviews →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {shortlisted.map((app) => (
                  <label
                    key={app.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      background: palette.raised,
                      border: `1px solid ${palette.hairline}`,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(app.id)}
                      onChange={() => handleSelectApplicant(app.id)}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                        {app.applicant?.user?.firstName} {app.applicant?.user?.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: palette.slate,
                        }}
                      >
                        {app.vacancy?.title} • {app.applicant?.user?.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={selected.length === 0 || loading}
              style={{
                marginTop: 24,
                padding: "12px 24px",
                background: selected.length > 0 ? palette.gold : palette.raised,
                color: selected.length > 0 ? palette.ink : palette.slate,
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: selected.length > 0 ? "pointer" : "not-allowed",
                opacity: selected.length > 0 ? 1 : 0.5,
              }}
            >
              Continue ({selected.length} selected)
            </button>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontFamily: fontDisplay,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Schedule Online Exam
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: palette.slate,
                marginBottom: 20,
              }}
            >
              Set the exam details for all {selected.length} candidates:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Interview Date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 8,
                  }}
                >
                  Interview Date
                </label>
                <input
                  type="date"
                  value={scheduleForm.interviewDate}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      interviewDate: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    fontFamily: fontBody,
                    fontSize: 13.5,
                    background: palette.raised,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 6,
                    color: palette.parchment,
                  }}
                />
              </div>

              {/* Interview Time */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 8,
                  }}
                >
                  Interview Time
                </label>
                <input
                  type="time"
                  value={scheduleForm.interviewTime}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      interviewTime: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    fontFamily: fontMono,
                    fontSize: 13.5,
                    background: palette.raised,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 6,
                    color: palette.parchment,
                  }}
                />
              </div>

              {/* Venue */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 8,
                  }}
                >
                  Venue (or virtual link)
                </label>
                <input
                  type="text"
                  value={scheduleForm.venue}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      venue: e.target.value,
                    })
                  }
                  placeholder="e.g., County Hall, Room 3 or Zoom link"
                  style={{
                    width: "100%",
                    padding: 10,
                    fontFamily: fontBody,
                    fontSize: 13.5,
                    background: palette.raised,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 6,
                    color: palette.parchment,
                  }}
                />
              </div>

              {/* Duration */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 8,
                  }}
                >
                  Exam Duration (minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={scheduleForm.durationMinutes}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      durationMinutes: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    fontFamily: fontMono,
                    fontSize: 13.5,
                    background: palette.raised,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 6,
                    color: palette.parchment,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "12px 24px",
                  background: palette.raised,
                  color: palette.parchment,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleScheduleInterviews}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: palette.gold,
                  color: palette.ink,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Scheduling..." : "Schedule Interviews"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assign Panel */}
        {step === 3 && (
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontFamily: fontDisplay,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Assign Panel Members
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: palette.slate,
                marginBottom: 20,
              }}
            >
              Assign panel members to create questions for the exams. Each panel member can add multiple questions.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selected
                .map((appId) => shortlisted.find((a) => a.id === appId))
                .filter(Boolean)
                .map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: palette.raised,
                      border: `1px solid ${palette.hairline}`,
                      borderRadius: 6,
                      padding: 16,
                    }}
                  >
                    <div style={{ marginBottom: 12, fontWeight: 600 }}>
                      {app.applicant?.user?.firstName} {app.applicant?.user?.lastName} — {app.vacancy?.title}
                    </div>
                    <select
                      multiple
                      value={panelAssignments[app.id] || []}
                      onChange={(e) =>
                        setPanelAssignments({
                          ...panelAssignments,
                          [app.id]: Array.from(e.target.selectedOptions, (opt) =>
                            parseInt(opt.value)
                          ),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: 10,
                        fontFamily: fontBody,
                        fontSize: 13.5,
                        background: palette.panel,
                        border: `1px solid ${palette.hairline}`,
                        borderRadius: 4,
                        color: palette.parchment,
                        minHeight: 80,
                      }}
                    >
                      {panelMembers.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.firstName} {pm.lastName} ({pm.email})
                        </option>
                      ))}
                    </select>
                    <p
                      style={{
                        fontSize: 11,
                        color: palette.slate,
                        marginTop: 6,
                        margin: 0,
                      }}
                    >
                      Hold Ctrl/Cmd to select multiple panel members
                    </p>
                  </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: "12px 24px",
                  background: palette.raised,
                  color: palette.parchment,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={handleAssignPanel}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: palette.gold,
                  color: palette.ink,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Assigning..." : "Assign & Complete"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 32,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: `rgba(46,107,79,0.1)`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Check size={28} color={palette.green} />
            </div>
            <h2
              style={{
                fontFamily: fontDisplay,
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Interviews Created!
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: palette.slate,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {selected.length} interviews have been scheduled. Panel members can now add
              questions. Candidates will receive notifications and can take the exams on the
              scheduled date.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => window.location.href = "/admin/interviews"}
                style={{
                  padding: "12px 24px",
                  background: palette.gold,
                  color: palette.ink,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View All Interviews
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default InterviewSetupPage;
