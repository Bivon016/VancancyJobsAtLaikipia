import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Calendar, Printer, Share2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { applicationsApi, jobsApi, profileApi } from "../../api";
import {
  formatDate,
  getVacancyTypeLabel,
  isProfileComplete,
} from "../../utils/constants";
import { normalizeRole } from "../../utils/roles";

export default function VacancyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    jobsApi
      .getById(id)
      .then(({ data }) => setVacancy(data))
      .catch(() => setError("Vacancy not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && normalizeRole(user?.role) === "APPLICANT") {
      applicationsApi
        .getMy()
        .then(({ data }) => {
          setApplied(data.some((a) => a.vacancy?.id === Number(id)));
        })
        .catch(() => {});
    }
  }, [id, isAuthenticated, user]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/vacancies/${id}/apply` } });
      return;
    }
    if (normalizeRole(user?.role) !== "APPLICANT") {
      setError("Only applicants can apply for vacancies.");
      return;
    }

    setApplying(true);
    setError("");
    try {
      const { data: profile } = await profileApi.get();
      if (!isProfileComplete(profile)) {
        navigate("/profile", {
          state: { incomplete: true, from: `/vacancies/${id}/apply` },
        });
        return;
      }
      navigate(`/vacancies/${id}/apply`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to prepare application form",
      );
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !vacancy) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/vacancies" className="text-sm text-secondary hover:underline">
        ← Back to vacancies
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card variant="plain">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-heading text-2xl font-bold text-primary md:text-3xl">
                {vacancy.title}
              </h1>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                {vacancy.status || "OPEN"}
              </span>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted">
              {vacancy.department && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {vacancy.department.departmentName}
                </span>
              )}
              {vacancy.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Posted{" "}
                  {formatDate(vacancy.createdAt)}
                </span>
              )}
            </div>

            <section className="mb-6">
              <h2 className="font-heading mb-2 text-lg font-bold">
                Job Description
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">
                {vacancy.jobDescription}
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-lg font-bold">
                Requirements
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">
                {vacancy.requirements}
              </p>
            </section>
          </Card>
        </div>

        <div className="space-y-4">
          <Card variant="plain">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Positions Available</dt>
                <dd className="font-semibold text-primary">
                  {vacancy.positionsAvailable}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Salary Scale</dt>
                <dd className="font-semibold">
                  {vacancy.salaryScale || "As per county scales"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Vacancy Type</dt>
                <dd className="font-semibold">
                  {getVacancyTypeLabel(vacancy.vacancyType)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="font-semibold text-green-700">
                  Accepting Applications
                </dd>
              </div>
            </dl>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <Button
              variant="accent"
              className="mt-6 w-full"
              onClick={handleApply}
              loading={applying}
              disabled={applied}
            >
              {applied ? "Already Applied" : "Start Application"}
            </Button>
            {applied && (
              <p className="mt-3 text-sm text-muted">
                You have already submitted an application for this vacancy.
                Application details are locked and cannot be changed.
              </p>
            )}
          </Card>

          <Card variant="plain" className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
