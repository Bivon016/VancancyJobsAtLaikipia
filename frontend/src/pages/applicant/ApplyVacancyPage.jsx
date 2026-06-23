import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CheckSquare,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Textarea } from "../../components/ui/Input";
import { applicationsApi, jobsApi, profileApi } from "../../api";
import {
  formatDate,
  getVacancyTypeLabel,
  isProfileComplete,
} from "../../utils/constants";

const REQUIRED_DOCUMENTS = [
  "Curriculum Vitae (CV)",
  "National ID Copy",
  "Academic and professional certificates",
  "Cover letter",
];

const DECLARATIONS = [
  {
    key: "declareInformationTrue",
    label:
      "I confirm that the information I have provided is true and accurate.",
  },
  {
    key: "declareAvailabilityForVerification",
    label:
      "I agree that Laikipia County may verify my academic, professional, and employment records.",
  },
  {
    key: "declareNoConflictOfInterest",
    label:
      "I confirm that I have no conflict of interest relating to this application.",
  },
  {
    key: "declareNoCriminalConviction",
    label:
      "I confirm that I have no undisclosed criminal conviction that would affect this appointment.",
  },
  {
    key: "consentToDataProcessing",
    label:
      "I consent to the processing of my personal data for recruitment purposes.",
  },
  {
    key: "documentsReadyConfirmed",
    label:
      "I have prepared the required supporting documents and will upload them immediately after submitting this application.",
  },
];

function createReferee() {
  return {
    fullName: "",
    designation: "",
    organization: "",
    phoneNumber: "",
    email: "",
    relationship: "",
  };
}

export default function ApplyVacancyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    suitabilityStatement: "",
    referees: [createReferee(), createReferee()],
    declareInformationTrue: false,
    declareAvailabilityForVerification: false,
    declareNoConflictOfInterest: false,
    declareNoCriminalConviction: false,
    consentToDataProcessing: false,
    documentsReadyConfirmed: false,
  });

  useEffect(() => {
    Promise.all([
      jobsApi.getById(id),
      profileApi.get().catch(() => ({ data: null })),
      applicationsApi.getMy().catch(() => ({ data: [] })),
    ])
      .then(([vacancyRes, profileRes, appsRes]) => {
        setVacancy(vacancyRes.data);
        setProfile(profileRes.data);
        setAlreadyApplied(
          appsRes.data.some((app) => app.vacancy?.id === Number(id)),
        );
      })
      .catch(() => setError("Unable to load the application form right now."))
      .finally(() => setLoading(false));
  }, [id]);

  const profileComplete = isProfileComplete(profile);

  const profileSummary = useMemo(
    () => [
      {
        label: "Profession",
        value: profile?.currentProfession || "Not provided",
      },
      {
        label: "Education",
        value: profile?.educationalLevel || "Not provided",
      },
      {
        label: "Experience",
        value:
          profile?.yearsOfExperience != null
            ? `${profile.yearsOfExperience} years`
            : "Not provided",
      },
      {
        label: "Residence",
        value:
          [profile?.countyOfResidence, profile?.subCounty]
            .filter(Boolean)
            .join(" • ") || "Not provided",
      },
    ],
    [profile],
  );

  const updateField = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateReferee = (index, field) => (e) => {
    const value = e.target.value;
    setForm((current) => ({
      ...current,
      referees: current.referees.map((referee, refIndex) =>
        refIndex === index ? { ...referee, [field]: value } : referee,
      ),
    }));
  };

  const addReferee = () => {
    setForm((current) => {
      if (current.referees.length >= 3) return current;
      return { ...current, referees: [...current.referees, createReferee()] };
    });
  };

  const removeReferee = (index) => {
    setForm((current) => {
      if (current.referees.length <= 2) return current;
      return {
        ...current,
        referees: current.referees.filter((_, refIndex) => refIndex !== index),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileComplete) {
      navigate("/profile", {
        state: { incomplete: true, from: `/vacancies/${id}/apply` },
      });
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        vacancyId: Number(id),
        suitabilityStatement: form.suitabilityStatement.trim(),
        declareInformationTrue: form.declareInformationTrue,
        declareAvailabilityForVerification:
          form.declareAvailabilityForVerification,
        declareNoConflictOfInterest: form.declareNoConflictOfInterest,
        declareNoCriminalConviction: form.declareNoCriminalConviction,
        consentToDataProcessing: form.consentToDataProcessing,
        documentsReadyConfirmed: form.documentsReadyConfirmed,
        referees: form.referees.map((referee) => ({
          fullName: referee.fullName.trim(),
          designation: referee.designation.trim(),
          organization: referee.organization.trim(),
          phoneNumber: referee.phoneNumber.trim(),
          email: referee.email.trim(),
          relationship: referee.relationship.trim(),
        })),
      };

      const { data } = await applicationsApi.apply(payload);
      navigate("/documents", {
        replace: true,
        state: {
          applicationId: String(data.id),
          message:
            "Application submitted successfully. Upload your supporting documents for this application next.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !vacancy) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-red-600">{error}</p>
        <Link
          to="/vacancies"
          className="mt-4 inline-block text-secondary hover:underline"
        >
          Back to vacancies
        </Link>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader
            title="Application already submitted"
            subtitle="You have already applied for this vacancy."
          />
          <div className="space-y-4 text-sm text-muted">
            <p>
              You can review your submitted application from your application
              history and continue uploading supporting documents if needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/applications">
                <Button>View My Applications</Button>
              </Link>
              <Link to="/documents">
                <Button variant="outline">Manage Documents</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to={`/vacancies/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to vacancy
      </Link>

      <div className="mt-4 rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Application workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
          Apply for {vacancy?.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Complete the vacancy-specific application details, confirm your
          declarations, and prepare your supporting documents.
        </p>
      </div>

      {!profileComplete && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">
              Complete your profile first
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Your applicant profile must be complete before this application
              can be submitted.
            </p>
            <Link to="/profile" className="mt-2 inline-block">
              <Button variant="accent" size="sm">
                Go to Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Suitability Statement"
              subtitle="Explain briefly why you are a strong fit for this vacancy."
              action={
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> Vacancy-specific
                </div>
              }
            />
            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea
                label="Statement of suitability"
                required
                rows={8}
                value={form.suitabilityStatement}
                onChange={updateField("suitabilityStatement")}
                placeholder="Describe your relevant skills, experience, qualifications, and why you are suitable for this specific role."
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Users className="h-4 w-4" /> Referees
                </div>
                <p className="mt-1 text-sm text-muted">
                  Provide at least 2 referees. You may add a third if needed.
                </p>
                <div className="mt-4 space-y-4">
                  {form.referees.map((referee, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          Referee {index + 1}
                        </p>
                        {form.referees.length > 2 && index >= 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReferee(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                          label="Full Name"
                          required
                          value={referee.fullName}
                          onChange={updateReferee(index, "fullName")}
                        />
                        <Input
                          label="Designation"
                          required
                          value={referee.designation}
                          onChange={updateReferee(index, "designation")}
                        />
                        <Input
                          label="Organization"
                          required
                          value={referee.organization}
                          onChange={updateReferee(index, "organization")}
                        />
                        <Input
                          label="Relationship"
                          required
                          value={referee.relationship}
                          onChange={updateReferee(index, "relationship")}
                        />
                        <Input
                          label="Phone Number"
                          required
                          value={referee.phoneNumber}
                          onChange={updateReferee(index, "phoneNumber")}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          required
                          value={referee.email}
                          onChange={updateReferee(index, "email")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {form.referees.length < 3 && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addReferee}
                    >
                      Add Third Referee
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" /> Declarations
                </div>
                <div className="mt-4 space-y-3">
                  {DECLARATIONS.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200/70"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={form[item.key]}
                        onChange={updateField(item.key)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm text-muted">
                  After submission, continue to the documents section to upload
                  your supporting files for this application.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={!profileComplete}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Vacancy Summary"
              subtitle="The position you are applying for."
            />
            <div className="space-y-3">
              <SummaryRow label="Position" value={vacancy?.title || "—"} />
              <SummaryRow
                label="Department"
                value={vacancy?.department?.departmentName || "—"}
              />
              <SummaryRow
                label="Posted"
                value={formatDate(vacancy?.createdAt)}
              />
              <SummaryRow
                label="Salary Scale"
                value={vacancy?.salaryScale || "As per county scales"}
              />
              <SummaryRow
                label="Vacancy Type"
                value={getVacancyTypeLabel(vacancy?.vacancyType)}
              />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary via-primary to-primary-light text-white">
            <div className="flex items-start gap-3">
              <Briefcase className="mt-1 h-6 w-6 flex-none text-accent" />
              <div>
                <h3 className="font-heading text-lg font-bold">
                  Profile summary
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  These details are pulled from your applicant profile.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {profileSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white/10 px-4 py-3"
                >
                  <p className="text-white/70">{item.label}</p>
                  <p className="mt-1 font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Required documents"
              subtitle="Prepare these files for upload right after submission."
              action={
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/5 px-3 py-1 text-xs font-semibold text-secondary">
                  <FileText className="h-4 w-4" /> Checklist
                </div>
              }
            />
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <div
                  key={doc}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                >
                  <CheckSquare className="mt-0.5 h-4 w-4 text-secondary" />
                  <p className="text-sm text-slate-700">{doc}</p>
                </div>
              ))}
            </div>
            <Link to="/documents" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-xl">
                Open Documents Page
              </Button>
            </Link>
          </Card>

          <Card>
            <CardHeader
              title="Before you submit"
              subtitle="Make sure your application package is complete."
            />
            <ul className="space-y-3 text-sm text-muted">
              {[
                "Your applicant profile must already be complete.",
                "Your suitability statement should target this vacancy specifically.",
                "Referee details should be current and reachable.",
                "Upload supporting documents immediately after submission.",
              ].map((step) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-xl bg-slate-50/80 px-4 py-3"
                >
                  <BadgeCheck className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
