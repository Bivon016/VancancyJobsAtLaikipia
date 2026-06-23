import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, ClipboardList, Trophy } from "lucide-react";
import Card, { CardHeader } from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/vacancies/StatusBadge";
import Button from "../../components/ui/Button";
import { applicationsApi } from "../../api";
import { APPLICATION_STATES, formatDateTime } from "../../utils/constants";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    applicationsApi
      .getMy()
      .then(({ data }) => {
        setApplications(data);
        setSelected(data[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(
    () => ({
      total: applications.length,
      active: applications.filter(
        (app) => app.applicationStatus !== APPLICATION_STATES.REJECTED,
      ).length,
      shortlisted: applications.filter(
        (app) => app.applicationStatus === APPLICATION_STATES.SHORTLISTED,
      ).length,
      selected: applications.filter(
        (app) => app.applicationStatus === APPLICATION_STATES.SELECTED,
      ).length,
    }),
    [applications],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Applicant workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
          My Applications
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Track the status of every job application you have submitted.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={ClipboardList}
          label="Total applications"
          value={summary.total}
          tone="from-blue-500/15 to-cyan-500/10"
        />
        <SummaryCard
          icon={Briefcase}
          label="Active processes"
          value={summary.active}
          tone="from-amber-500/15 to-orange-500/10"
        />
        <SummaryCard
          icon={ArrowRight}
          label="Shortlisted"
          value={summary.shortlisted}
          tone="from-violet-500/15 to-fuchsia-500/10"
        />
        <SummaryCard
          icon={Trophy}
          label="Selected"
          value={summary.selected}
          tone="from-emerald-500/15 to-teal-500/10"
        />
      </div>

      {applications.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            title="No applications yet"
            description="Browse open vacancies and submit your first application."
            action={
              <Link to="/vacancies">
                <Button variant="primary">Browse Vacancies</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Application Timeline"
              subtitle="Select an application to review its current progress."
            />
            <div className="space-y-3">
              {applications.map((app) => {
                const isActive = selected?.id === app.id;
                return (
                  <Card
                    key={app.id}
                    padding={false}
                    className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                      isActive
                        ? "border-primary/30 bg-primary/[0.04] shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                    onClick={() => setSelected(app)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {app.vacancy?.title}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {app.vacancy?.department?.departmentName ||
                            "Department not specified"}
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          Submitted {formatDateTime(app.applicationDate)}
                        </p>
                      </div>
                      <StatusBadge status={app.applicationStatus} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Application Details"
              subtitle="Detailed information about the selected application."
            />
            {selected ? (
              <div className="space-y-4">
                <DetailRow
                  label="Position"
                  value={selected.vacancy?.title || "—"}
                />
                <DetailRow
                  label="Department"
                  value={selected.vacancy?.department?.departmentName || "—"}
                />
                <DetailRow
                  label="Submitted"
                  value={formatDateTime(selected.applicationDate)}
                />
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-sm text-muted">Status</p>
                  <div className="mt-2">
                    <StatusBadge status={selected.applicationStatus} />
                  </div>
                </div>
                {selected.suitabilityStatement && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-sm text-muted">Suitability Statement</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selected.suitabilityStatement}
                    </p>
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-sm text-muted">Declarations</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    <li>
                      Information confirmed:{" "}
                      {selected.declareInformationTrue ? "Yes" : "No"}
                    </li>
                    <li>
                      Verification consent:{" "}
                      {selected.declareAvailabilityForVerification
                        ? "Yes"
                        : "No"}
                    </li>
                    <li>
                      Conflict of interest declared absent:{" "}
                      {selected.declareNoConflictOfInterest ? "Yes" : "No"}
                    </li>
                    <li>
                      Criminal disclosure confirmed:{" "}
                      {selected.declareNoCriminalConviction ? "Yes" : "No"}
                    </li>
                    <li>
                      Documents ready at submission:{" "}
                      {selected.documentsReadyConfirmed ? "Yes" : "No"}
                    </li>
                  </ul>
                </div>
                {selected.referees?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-sm text-muted">Referees</p>
                    <div className="mt-3 space-y-3">
                      {selected.referees.map((referee, index) => (
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
                {selected.remarks && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-sm text-muted">Remarks</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {selected.remarks}
                    </p>
                  </div>
                )}
                <Link to="/documents">
                  <Button variant="outline" className="mt-2 rounded-xl">
                    Manage Documents
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Select an application to view details.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <Card className={`bg-gradient-to-br ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-primary shadow-sm ring-1 ring-slate-200/70">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
          Summary
        </span>
      </div>
      <p className="mt-8 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-primary">
        {value}
      </p>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
