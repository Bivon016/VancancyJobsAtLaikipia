import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import PdfReportView from "../../components/pdf/PdfReportView";
import { adminApi, applicationsApi, interviewsApi, scoresApi } from "../../api";
import {
  APPLICATION_STATES,
  formatDate,
  getApplicantName,
} from "../../utils/constants";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLES } from "../../utils/roles";

const COLUMNS = [
  { key: "no", header: "#" },
  { key: "candidate", header: "Candidate" },
  { key: "position", header: "Position" },
  { key: "date", header: "Interview Date" },
  { key: "time", header: "Time" },
  { key: "venue", header: "Venue" },
  { key: "status", header: "Status" },
];

const getApplicantReference = (application) => {
  if (!application) return "—";
  const name = getApplicantName(application);
  const nationalId = application.applicant?.nationalId
    ? `ID ${application.applicant.nationalId}`
    : null;
  const email = application.applicant?.user?.email || null;

  return [name, nationalId, email].filter(Boolean).join(" • ");
};

const getInterviewLabel = (interview) => {
  if (!interview) return "—";
  return [
    getApplicantName(interview.application),
    interview.application?.vacancy?.title || null,
    formatDate(interview.interviewDate),
    interview.interviewTime || null,
  ]
    .filter(Boolean)
    .join(" — ");
};

export default function InterviewsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isPanel = role === ROLES.PANEL_MEMBER;
  const canManageInterviews =
    role === ROLES.HR_OFFICER || role === ROLES.SUPER_ADMIN;

  const [interviews, setInterviews] = useState([]);
  const [shortlistedApplications, setShortlistedApplications] = useState([]);
  const [panelMembers, setPanelMembers] = useState([]);
  const [panelModalOpen, setPanelModalOpen] = useState(false);
  const [panelForm, setPanelForm] = useState({
    interviewId: "",
    panelMemberId: "",
  });
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState("");
  const [selectedVacancyId, setSelectedVacancyId] = useState("");
  const [selectedApplicationIds, setSelectedApplicationIds] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: "",
    interviewTime: "",
    venue: "",
  });
  const [scoreForm, setScoreForm] = useState({
    interviewId: "",
    technicalScore: "",
    communicationScore: "",
    experienceScore: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const shortlistedGroups = useMemo(() => {
    const groups = shortlistedApplications.reduce((acc, application) => {
      if (application.applicationStatus !== APPLICATION_STATES.SHORTLISTED) {
        return acc;
      }

      const vacancyId = application?.vacancy?.id;
      if (!vacancyId) {
        return acc;
      }

      const existing = acc.get(vacancyId) || {
        vacancyId,
        title: application?.vacancy?.title || "Untitled vacancy",
        department:
          application?.vacancy?.department?.departmentName ||
          "Unknown department",
        applications: [],
      };

      existing.applications.push(application);
      acc.set(vacancyId, existing);
      return acc;
    }, new Map());

    return Array.from(groups.values()).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [shortlistedApplications]);

  const effectiveVacancyId = shortlistedGroups.some(
    (group) => String(group.vacancyId) === String(selectedVacancyId),
  )
    ? String(selectedVacancyId)
    : shortlistedGroups[0]
      ? String(shortlistedGroups[0].vacancyId)
      : "";

  const selectedGroup = useMemo(() => {
    if (!effectiveVacancyId) {
      return null;
    }

    return (
      shortlistedGroups.find(
        (group) => String(group.vacancyId) === String(effectiveVacancyId),
      ) || null
    );
  }, [effectiveVacancyId, shortlistedGroups]);

  const activeSelectedApplicationIds = selectedApplicationIds.filter((id) =>
    selectedGroup?.applications?.some((application) => application.id === id),
  );

  const load = useCallback(async () => {
    const interviewFetcher = isPanel
      ? interviewsApi.getMy()
      : interviewsApi.getByStatus("SCHEDULED");

    if (canManageInterviews) {
      const [interviewResult, applicationResult, panelResult] =
        await Promise.allSettled([
          interviewFetcher,
          applicationsApi.getAll(),
          adminApi.getUsers([ROLES.PANEL_MEMBER]),
        ]);

      if (interviewResult.status === "fulfilled") {
        setInterviews(interviewResult.value.data);
      } else {
        setInterviews([]);
      }

      if (applicationResult.status === "fulfilled") {
        setShortlistedApplications(
          Array.isArray(applicationResult.value.data)
            ? applicationResult.value.data
            : [],
        );
      } else {
        setShortlistedApplications([]);
      }

      if (panelResult.status === "fulfilled") {
        setPanelMembers(
          Array.isArray(panelResult.value.data)
            ? panelResult.value.data
            : [],
        );
      } else {
        setPanelMembers([]);
      }

      if (
        interviewResult.status === "rejected" &&
        applicationResult.status === "fulfilled"
      ) {
        setMessage(
          "Shortlisted applicants loaded, but the scheduled interview list could not be loaded.",
        );
      }

      return;
    }

    try {
      const { data } = await interviewFetcher;
      setInterviews(data);
    } catch {
      setInterviews([]);
    }
  }, [canManageInterviews, isPanel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  const handleToggleApplication = (applicationId) => {
    setSelectedApplicationIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId],
    );
  };

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!activeSelectedApplicationIds.length) {
      setMessage("Select at least one shortlisted applicant.");
      return;
    }

    setLoading(true);
    setMessage("");

    const failures = [];
    let scheduledCount = 0;

    for (const applicationId of activeSelectedApplicationIds) {
      const application = selectedGroup?.applications?.find(
        (item) => item.id === applicationId,
      );
      const applicantLabel = getApplicantReference(application);

      try {
        await interviewsApi.schedule({
          applicationId,
          interviewDate: scheduleForm.interviewDate,
          interviewTime: scheduleForm.interviewTime,
          venue: scheduleForm.venue,
        });
        scheduledCount += 1;
      } catch (err) {
        failures.push(
          `${applicantLabel}: ${err.response?.data?.message || "Failed to schedule"}`,
        );
      }
    }

    await load();

    if (scheduledCount > 0) {
      setSelectedApplicationIds([]);
      setScheduleForm({
        interviewDate: scheduleForm.interviewDate,
        interviewTime: scheduleForm.interviewTime,
        venue: scheduleForm.venue,
      });
    }

    const scheduledLabels = activeSelectedApplicationIds
      .map((applicationId) =>
        getApplicantReference(
          selectedGroup?.applications?.find(
            (item) => item.id === applicationId,
          ),
        ),
      )
      .filter(Boolean)
      .join(" | ");

    if (scheduledCount > 0 && failures.length === 0) {
      setMessage(
        `Scheduled ${scheduledCount} interview(s) successfully for ${scheduledLabels}`,
      );
    } else if (scheduledCount > 0) {
      setMessage(
        `Scheduled ${scheduledCount} interview(s) for ${scheduledLabels}. Some could not be scheduled: ${failures.join(" | ")}`,
      );
    } else {
      setMessage(failures.join(" | ") || "Failed to schedule interviews.");
    }

    setLoading(false);
  };

  async function openPanelAssignModal() {
    setPanelLoading(true);
    setPanelError("");
    setPanelForm({ interviewId: "", panelMemberId: "" });

    try {
      await load();
      setPanelModalOpen(true);
    } finally {
      setPanelLoading(false);
    }
  }

  function closePanelAssignModal() {
    if (panelLoading) return;
    setPanelModalOpen(false);
    setPanelError("");
  }

  async function handleAssignPanelMember(e) {
    e.preventDefault();
    if (!panelForm.interviewId || !panelForm.panelMemberId) {
      setPanelError("Select both the interview and panel member.");
      return;
    }

    setPanelLoading(true);
    setPanelError("");
    try {
      await interviewsApi.addPanelMember({
        interviewId: Number(panelForm.interviewId),
        panelMemberId: Number(panelForm.panelMemberId),
      });
      await load();
      setPanelModalOpen(false);
      setPanelForm({ interviewId: "", panelMemberId: "" });
      setMessage("Panel member assigned successfully.");
    } catch (err) {
      setPanelError(err.response?.data?.message || "Failed to assign panel member.");
    } finally {
      setPanelLoading(false);
    }
  }


  const handleScore = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await scoresApi.submit({
        interviewId: Number(scoreForm.interviewId),
        technicalScore: Number(scoreForm.technicalScore),
        communicationScore: Number(scoreForm.communicationScore),
        experienceScore: Number(scoreForm.experienceScore),
        remarks: scoreForm.remarks,
      });
      setMessage("Score submitted.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Interviews
      </h1>
      <p className="mt-1 text-muted">
        {isPanel
          ? "View assigned interviews and submit scores"
          : canManageInterviews
            ? "Schedule interviews by job category and shortlisted applicant names"
            : "View interview schedules and reports"}
      </p>

      {canManageInterviews && (
        <Card className="mt-6">
          <CardHeader
            title="Schedule Interviews"
            subtitle="Choose a job category, then select one or more shortlisted applicants under it."
          />
          <form onSubmit={handleSchedule} className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Job Category / Vacancy"
              value={effectiveVacancyId}
              onChange={(e) => {
                setSelectedVacancyId(e.target.value);
                setSelectedApplicationIds([]);
              }}
              disabled={!shortlistedGroups.length}
            >
              {!shortlistedGroups.length ? (
                <option value="">No shortlisted applicants available</option>
              ) : (
                shortlistedGroups.map((group) => (
                  <option key={group.vacancyId} value={group.vacancyId}>
                    {group.title} — {group.department} (
                    {group.applications.length})
                  </option>
                ))
              )}
            </Select>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Selected applicants</p>
              <p className="mt-1">
                {activeSelectedApplicationIds.length
                  ? `${activeSelectedApplicationIds.length} applicant(s) selected for scheduling.`
                  : "No applicant selected yet."}
              </p>
            </div>

            <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Shortlisted applicants
                  </p>
                  <p className="text-xs text-muted">
                    Applicants are grouped under the selected job category.
                  </p>
                </div>
                {selectedGroup?.applications?.length ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedApplicationIds(
                          selectedGroup.applications.map((app) => app.id),
                        )
                      }
                    >
                      Select all
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApplicationIds([])}
                    >
                      Clear
                    </Button>
                  </div>
                ) : null}
              </div>

              {!selectedGroup?.applications?.length ? (
                <p className="mt-4 text-sm text-muted">
                  No shortlisted applicants found for interview scheduling.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {selectedGroup.applications.map((application) => {
                    const applicantName = getApplicantName(application);
                    const checked = activeSelectedApplicationIds.includes(
                      application.id,
                    );

                    return (
                      <label
                        key={application.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={checked}
                          onChange={() =>
                            handleToggleApplication(application.id)
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {applicantName}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {application.applicant?.user?.email || "No email"}
                            {application.applicant?.nationalId
                              ? ` • ID ${application.applicant.nationalId}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {application.vacancy?.title || "Vacancy"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <Input
              label="Date"
              type="date"
              required
              value={scheduleForm.interviewDate}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  interviewDate: e.target.value,
                })
              }
            />
            <Input
              label="Time"
              type="time"
              required
              value={scheduleForm.interviewTime}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  interviewTime: e.target.value,
                })
              }
            />
            <Input
              label="Venue"
              required
              className="sm:col-span-2"
              value={scheduleForm.venue}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, venue: e.target.value })
              }
            />
            <Button
              type="submit"
              loading={loading}
              disabled={
                !activeSelectedApplicationIds.length ||
                !shortlistedGroups.length
              }
            >
              Schedule Selected Applicants
            </Button>
          </form>
        </Card>
      )}

      {canManageInterviews && (
        <div className="mt-6">
          <Button type="button" onClick={openPanelAssignModal}>
            Assign Panel Member
          </Button>
        </div>
      )}

      {panelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closePanelAssignModal}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-secondary">
                  Assign Panel Member
                </h3>
                <p className="text-sm text-muted">
                  Choose a scheduled interview and assign a panel member.
                </p>
              </div>
              <button
                onClick={closePanelAssignModal}
                className="text-slate-400 hover:text-secondary"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <form onSubmit={handleAssignPanelMember} className="space-y-4">
              <Select
                label="Interview"
                required
                value={panelForm.interviewId}
                onChange={(e) =>
                  setPanelForm({
                    ...panelForm,
                    interviewId: e.target.value,
                  })
                }
              >
                <option value="">Select interview</option>
                {interviews.length === 0 ? (
                  <option value="" disabled>
                    No scheduled interviews available
                  </option>
                ) : (
                  interviews.map((interview) => (
                    <option key={interview.id} value={interview.id}>
                      {getInterviewLabel(interview)}
                    </option>
                  ))
                )}
              </Select>

              <Select
                label="Panel Member"
                required
                value={panelForm.panelMemberId}
                onChange={(e) =>
                  setPanelForm({
                    ...panelForm,
                    panelMemberId: e.target.value,
                  })
                }
              >
                <option value="">Select panel member</option>
                {panelMembers.length === 0 ? (
                  <option value="" disabled>
                    No panel members available
                  </option>
                ) : (
                  panelMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fName} {member.lName} — {member.email}
                    </option>
                  ))
                )}
              </Select>

              {panelError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {panelError}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closePanelAssignModal}
                  disabled={panelLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={panelLoading || !interviews.length || !panelMembers.length}
                  className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-dark disabled:opacity-50"
                >
                  {panelLoading ? "Assigning…" : "Assign Panel Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPanel && (
        <Card className="mt-6">
          <CardHeader title="Submit Interview Score" />
          <form onSubmit={handleScore} className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Interview"
              required
              value={scoreForm.interviewId}
              onChange={(e) =>
                setScoreForm({ ...scoreForm, interviewId: e.target.value })
              }
            >
              <option value="">Select interview</option>
              {interviews.map((interview) => (
                <option key={interview.id} value={interview.id}>
                  {getInterviewLabel(interview)}
                </option>
              ))}
            </Select>
            <Input
              label="Technical Score"
              type="number"
              step="0.1"
              required
              value={scoreForm.technicalScore}
              onChange={(e) =>
                setScoreForm({ ...scoreForm, technicalScore: e.target.value })
              }
            />
            <Input
              label="Communication Score"
              type="number"
              step="0.1"
              required
              value={scoreForm.communicationScore}
              onChange={(e) =>
                setScoreForm({
                  ...scoreForm,
                  communicationScore: e.target.value,
                })
              }
            />
            <Input
              label="Experience Score"
              type="number"
              step="0.1"
              required
              value={scoreForm.experienceScore}
              onChange={(e) =>
                setScoreForm({ ...scoreForm, experienceScore: e.target.value })
              }
            />
            <Input
              label="Remarks"
              className="sm:col-span-2"
              value={scoreForm.remarks}
              onChange={(e) =>
                setScoreForm({ ...scoreForm, remarks: e.target.value })
              }
            />
            {scoreForm.interviewId && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:col-span-2">
                Confirming interview:{" "}
                <span className="font-semibold">
                  {getInterviewLabel(
                    interviews.find(
                      (interview) =>
                        String(interview.id) === String(scoreForm.interviewId),
                    ),
                  )}
                </span>
              </div>
            )}
            <Button
              type="submit"
              loading={loading}
              disabled={!scoreForm.interviewId}
            >
              Submit Score
            </Button>
          </form>
        </Card>
      )}

      {message && <p className="mt-4 text-sm text-muted">{message}</p>}

      <div className="mt-6">
        <PdfReportView
          title={isPanel ? "My Assigned Interviews" : "Scheduled Interviews"}
          subtitle="Laikipia County Public Service Board — Interview Schedule"
          columns={COLUMNS}
          filename="interview_schedule.pdf"
          fetchData={async () => interviews}
          buildRows={(items) =>
            items.map((iv, i) => ({
              no: i + 1,
              candidate: getApplicantName(iv.application),
              position: iv.application?.vacancy?.title || "—",
              date: formatDate(iv.interviewDate),
              time: iv.interviewTime || "—",
              venue: iv.venue || "—",
              status: iv.status || "—",
            }))
          }
        />
      </div>
    </div>
  );
}
