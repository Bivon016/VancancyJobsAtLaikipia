import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  ExternalLink,
  FileBadge2,
  FileText,
  MapPinned,
  UserRoundSearch,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import PdfReportView from "../../components/pdf/PdfReportView";
import StatusBadge from "../../components/vacancies/StatusBadge";
import {
  applicationsApi,
  assessmentApi,
  documentsApi,
  jobsApi,
  shortlistApi,
} from "../../api";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLES } from "../../utils/roles";
import {
  formatDateTime,
  getApplicantName,
  getVacancyTypeLabel,
} from "../../utils/constants";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const COLUMNS = [
  { key: "no", header: "#" },
  { key: "name", header: "Applicant Name" },
  { key: "email", header: "Email" },
  { key: "nationalId", header: "National ID" },
  { key: "vacancyType", header: "Vacancy Type" },
  { key: "education", header: "Education" },
  { key: "experience", header: "Experience (Yrs)" },
  { key: "shortlistedDate", header: "Shortlisted On" },
  { key: "remarks", header: "Remarks" },
];

export default function ShortlistsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageShortlists =
    role === ROLES.HR_OFFICER || role === ROLES.CPSB_ADMIN;

  const [vacancies, setVacancies] = useState([]);
  const [vacancyId, setVacancyId] = useState("");
  const [applications, setApplications] = useState([]);
  const [shortlistAppId, setShortlistAppId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [assessmentSummary, setAssessmentSummary] = useState(null);

  useEffect(() => {
    jobsApi
      .getAllOpen()
      .then(({ data }) => {
        setVacancies(data);
        if (data.length) {
          setVacancyId(String(data[0].id));
          loadAssessmentSummary(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!vacancyId) return;
    loadAssessmentSummary(Number(vacancyId));
  }, [vacancyId]);

  const loadDocuments = useCallback(async (applicationId) => {
    if (!applicationId) {
      setDocuments([]);
      setDocumentsError("");
      setDocumentsLoading(false);
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const { data } = await documentsApi.getByApplication(applicationId);
      setDocuments(data);
    } catch (err) {
      setDocuments([]);
      setDocumentsError(
        err.response?.data?.message || "Failed to load applicant documents.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!vacancyId) return;
    applicationsApi.getByVacancy(vacancyId).then(({ data }) => {
      setApplications(data);
      const nextAppId = data[0] ? String(data[0].id) : "";
      const activeAppId = data.some(
        (application) => String(application.id) === shortlistAppId,
      )
        ? shortlistAppId
        : nextAppId;

      setShortlistAppId(activeAppId);
      loadDocuments(activeAppId);
    });
  }, [vacancyId, shortlistAppId, loadDocuments]);

  const handleApplicationChange = (value) => {
    setShortlistAppId(value);
    loadDocuments(value);
  };

  const selectedVacancy = vacancies.find((v) => v.id === Number(vacancyId));
  const selectedApplication = useMemo(
    () => applications.find((a) => a.id === Number(shortlistAppId)) || null,
    [applications, shortlistAppId],
  );

  const selectedApplicantAssessment = useMemo(() => {
    if (!assessmentSummary?.responses?.length || !selectedApplication) {
      return null;
    }
    const email = selectedApplication.applicant?.user?.email;
    return assessmentSummary.responses.find((response) => {
      if (!response) return false;
      if (email && response.applicantEmail === email) return true;
      return response.applicantName === getApplicantName(selectedApplication);
    });
  }, [assessmentSummary, selectedApplication]);

  const assessmentRecommendationCounts = useMemo(() => {
    const counts = {
      PROCEED: 0,
      HOLD: 0,
      DO_NOT_PROCEED: 0,
      PENDING: 0,
    };

    (assessmentSummary?.responses || []).forEach((response) => {
      const recommendation = response?.recommendation
        ? typeof response.recommendation === "string"
          ? response.recommendation
          : response.recommendation.name
        : "PENDING";

      if (counts[recommendation] !== undefined) {
        counts[recommendation] += 1;
      } else {
        counts.PENDING += 1;
      }
    });

    return counts;
  }, [assessmentSummary]);

  const loadAssessmentSummary = async (vacancyId) => {
    try {
      const { data } = await assessmentApi.getSummary(vacancyId);
      setAssessmentSummary(data);
    } catch (err) {
      setAssessmentSummary(null);
    }
  };

  const handleShortlist = async (e) => {
    e.preventDefault();
    if (!shortlistAppId) return;
    setLoading(true);
    try {
      await shortlistApi.create({
        applicationId: Number(shortlistAppId),
        remarks,
      });
      const applicantReference = selectedApplication
        ? [
            getApplicantName(selectedApplication),
            selectedApplication.applicant?.nationalId
              ? `ID ${selectedApplication.applicant.nationalId}`
              : null,
            selectedApplication.applicant?.user?.email || null,
          ]
            .filter(Boolean)
            .join(" • ")
        : "Applicant";
      setMessage(`Shortlisted: ${applicantReference}`);
      setRemarks("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to shortlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Recruitment workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-secondary">
          Shortlist Management
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Review applicant profiles, confirm qualifications, and shortlist the
          strongest candidates for the next recruitment stage.
        </p>
      </div>

      {canManageShortlists && (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Shortlist Applicant"
              subtitle="Select a vacancy and review a candidate before adding them to the shortlist."
            />
            {assessmentSummary && (
              <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-700">
                <div className="mb-3 text-sm font-semibold text-secondary">Assessment guidance</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Vacancy</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{assessmentSummary.vacancyTitle}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Responses</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{assessmentSummary.totalSubmitted}</p>
                    <p className="text-xs text-slate-500">Participant submissions</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Shortlisted</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{assessmentSummary.totalShortlisted}</p>
                    <p className="text-xs text-slate-500">Already shortlisted</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Proceed</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">{assessmentRecommendationCounts.PROCEED}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hold</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-700">{assessmentRecommendationCounts.HOLD}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Do not proceed</p>
                    <p className="mt-2 text-2xl font-semibold text-rose-700">{assessmentRecommendationCounts.DO_NOT_PROCEED}</p>
                  </div>
                </div>
                {assessmentSummary.responses?.length > 0 && (
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest recommended applicants</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {assessmentSummary.responses.length} total responses
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {assessmentSummary.responses.slice(0, 3).map((response) => (
                        <li key={response.responseId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div>
                            <p className="font-medium text-slate-900">{response.applicantName}</p>
                            <p className="text-xs text-slate-500">{response.applicantEmail}</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            {response.recommendation?.replace(/_/g, " ") || "Pending"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <form onSubmit={handleShortlist} className="space-y-5">
              <Select
                label="Vacancy"
                value={vacancyId}
                onChange={(e) => setVacancyId(e.target.value)}
                className="max-w-xl"
              >
                {vacancies.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </Select>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-secondary">
                      Applicants for this vacancy
                    </p>
                    <p className="text-sm text-muted">
                      Select an applicant from the list to review their profile,
                      qualifications, and documents.
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary/5 px-3 py-1 text-xs font-semibold text-secondary">
                    {applications.length} applicant
                    {applications.length === 1 ? "" : "s"}
                  </span>
                </div>

                {applications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 text-sm text-muted">
                    No applications found for this vacancy.
                  </div>
                ) : (
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {applications.map((application) => {
                      const isSelected =
                        selectedApplication?.id === application.id;
                      return (
                        <button
                          key={application.id}
                          type="button"
                          onClick={() =>
                            handleApplicationChange(String(application.id))
                          }
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            isSelected
                              ? "border-secondary/30 bg-secondary/[0.05] shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {getApplicantName(application)}
                              </p>
                              <p className="mt-1 text-sm text-muted">
                                {application.applicant?.user?.email || "—"}
                              </p>
                              <p className="mt-2 text-xs text-muted">
                                {application.applicant?.educationalLevel ||
                                  "Education not set"}
                                {application.applicant
                                  ?.educationYearOfCompletion
                                  ? ` • ${application.applicant.educationYearOfCompletion}`
                                  : ""}
                              </p>
                              <p className="mt-1 text-xs text-muted">
                                Applied{" "}
                                {formatDateTime(application.applicationDate)}
                              </p>
                            </div>
                            <StatusBadge
                              status={application.applicationStatus}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Input
                label="Shortlist Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes for shortlisting"
              />
              {message && <p className="text-sm text-muted">{message}</p>}
              <Button
                type="submit"
                loading={loading}
                disabled={!selectedApplication}
              >
                Add to Shortlist
              </Button>
            </form>
          </Card>

          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Applicant Review"
              subtitle="Full profile and qualification summary for shortlisting decisions."
              action={
                selectedApplication ? (
                  <StatusBadge status={selectedApplication.applicationStatus} />
                ) : null
              }
            />

            {selectedApplication ? (
              <div className="space-y-5">
                <Section
                  icon={UserRoundSearch}
                  title="Applicant Identity"
                  items={[
                    {
                      label: "Full name",
                      value: getApplicantName(selectedApplication),
                    },
                    {
                      label: "Email",
                      value: selectedApplication.applicant?.user?.email || "—",
                    },
                    {
                      label: "National ID",
                      value: selectedApplication.applicant?.nationalId || "—",
                    },
                    {
                      label: "Gender",
                      value: selectedApplication.applicant?.gender || "—",
                    },
                    {
                      label: "Marital status",
                      value:
                        selectedApplication.applicant?.maritalStatus || "—",
                    },
                    {
                      label: "Nationality",
                      value: selectedApplication.applicant?.nationality || "—",
                    },
                  ]}
                />

                <Section
                  icon={MapPinned}
                  title="Residence and Inclusion"
                  items={[
                    {
                      label: "County of birth",
                      value:
                        selectedApplication.applicant?.countyOfBirth || "—",
                    },
                    {
                      label: "County of residence",
                      value:
                        selectedApplication.applicant?.countyOfResidence || "—",
                    },
                    {
                      label: "Sub county / ward",
                      value:
                        [
                          selectedApplication.applicant?.subCounty,
                          selectedApplication.applicant?.ward,
                        ]
                          .filter(Boolean)
                          .join(" • ") || "—",
                    },
                    {
                      label: "Village",
                      value: selectedApplication.applicant?.village || "—",
                    },
                    {
                      label: "Physical address",
                      value:
                        selectedApplication.applicant?.physicalAddress || "—",
                    },
                    {
                      label: "Disability",
                      value: selectedApplication.applicant?.disabilityStatus
                        ? selectedApplication.applicant?.disabilityType ||
                          "Declared"
                        : "Not declared",
                    },
                  ]}
                />

                <Section
                  icon={FileBadge2}
                  title="Qualifications"
                  items={[
                    {
                      label: "Education type",
                      value:
                        selectedApplication.applicant?.educationalLevel || "—",
                    },
                    {
                      label: "Year of completion",
                      value:
                        selectedApplication.applicant
                          ?.educationYearOfCompletion || "—",
                    },
                    {
                      label: "Years of experience",
                      value:
                        selectedApplication.applicant?.yearsOfExperience ?? "—",
                    },
                    {
                      label: "Current profession",
                      value:
                        selectedApplication.applicant?.currentProfession || "—",
                    },
                    {
                      label: "Ethnicity",
                      value: selectedApplication.applicant?.ethnicity || "—",
                    },
                    {
                      label: "Applied on",
                      value: formatDateTime(
                        selectedApplication.applicationDate,
                      ),
                    },
                  ]}
                />

                {selectedApplicantAssessment && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          Pre-screening assessment result
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          Use the applicant's assessment recommendation to support shortlist decisions.
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
                        {selectedApplicantAssessment.recommendation?.replace(/_/g, " ") || "Pending"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Submitted</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {selectedApplicantAssessment.submittedAt
                            ? new Date(selectedApplicantAssessment.submittedAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Answered questions</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {selectedApplicantAssessment.answers?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApplication.suitabilityStatement && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                      <Briefcase className="h-4 w-4" /> Suitability Statement
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedApplication.suitabilityStatement}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                    <FileText className="h-4 w-4" /> Uploaded Documents
                  </div>
                  {documentsLoading ? (
                    <p className="mt-3 text-sm text-muted">
                      Loading documents...
                    </p>
                  ) : documentsError ? (
                    <p className="mt-3 text-sm text-red-600">
                      {documentsError}
                    </p>
                  ) : documents.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">
                      No supporting documents uploaded for this application yet.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {doc.documentType}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              Uploaded {formatDateTime(doc.uploadDate)}
                            </p>
                          </div>
                          <a
                            href={buildDocumentUrl(doc.filePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white"
                          >
                            Review document
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedApplication.referees?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <p className="text-sm font-semibold text-secondary">
                      Referees
                    </p>
                    <div className="mt-3 space-y-3">
                      {selectedApplication.referees.map((referee, index) => (
                        <div
                          key={`${referee.email}-${index}`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <p className="font-medium text-slate-900">
                            {referee.fullName}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {referee.designation} · {referee.organization}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {referee.phoneNumber} · {referee.email}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            Relationship: {referee.relationship}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Select an application to review the candidate profile,
                qualifications, and documents.
              </p>
            )}
          </Card>
        </div>
      )}

      <div className="mt-8">
        <Select
          label="View Shortlist PDF for"
          value={vacancyId}
          onChange={(e) => setVacancyId(e.target.value)}
          className="mb-4 max-w-md"
        >
          {vacancies.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </Select>

        <PdfReportView
          key={vacancyId}
          title={`Shortlisted Candidates — ${selectedVacancy?.title || ""}`}
          subtitle={`${selectedVacancy?.department?.departmentName || ""} — Official Shortlist Register`}
          columns={COLUMNS}
          filename={`shortlist_vacancy_${vacancyId}.pdf`}
          fetchData={async () => {
            const { data } = await shortlistApi.getByVacancy(vacancyId);
            return data;
          }}
          buildRows={(items) =>
            items.map((s, i) => ({
              no: i + 1,
              name: s.applicantName || "—",
              email: s.applicantEmail || "—",
              nationalId: s.applicantNationalId || "—",
              vacancyType: getVacancyTypeLabel(s.vacancyType),
              education: s.educationalLevel || "—",
              experience: s.yearsOfExperience ?? "—",
              shortlistedDate: formatDateTime(s.shortlistedDate),
              remarks: s.remarks || "—",
            }))
          }
        />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, items }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <p className="text-xs uppercase tracking-wide text-muted">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {item.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildDocumentUrl(filePath) {
  if (!filePath) return "#";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${API_BASE}${normalizedPath}`;
}
