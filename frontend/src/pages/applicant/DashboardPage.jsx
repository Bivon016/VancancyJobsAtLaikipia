import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  FileText,
  MapPinned,
  Sparkles,
  User,
} from "lucide-react";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/vacancies/StatusBadge";
import { applicationsApi, notificationsApi, profileApi } from "../../api";
import { formatDateTime, isProfileComplete } from "../../utils/constants";

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    Promise.all([
      profileApi.get().catch(() => {
        setProfileError(true);
        return { data: null };
      }),
      applicationsApi.getMy().catch(() => ({ data: [] })),
      notificationsApi.getUnread().catch(() => ({ data: [] })),
    ])
      .then(([prof, apps, notifs]) => {
        setProfile(prof.data);
        setApplications(apps.data);
        setUnreadCount(notifs.data.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const complete = isProfileComplete(profile);

  const profileSummary = useMemo(
    () => ({
      profession: profile?.currentProfession || "Not added yet",
      residence: [profile?.countyOfResidence, profile?.subCounty]
        .filter(Boolean)
        .join(" • "),
      nationality: profile?.nationality || "Not added yet",
      disability:
        profile?.disabilityStatus == null
          ? "Not specified"
          : profile.disabilityStatus
            ? "Declared"
            : "None declared",
    }),
    [profile],
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
          Applicant Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Welcome to the Laikipia County recruitment portal.
        </p>
      </div>

      {(profileError || !complete) && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Profile incomplete</p>
            <p className="mt-1 text-sm text-amber-800">
              Complete your profile before applying for vacancies.
            </p>
            <Link to="/profile" className="mt-2 inline-block">
              <Button variant="accent" size="sm">
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <QuickLink
          to="/profile"
          icon={User}
          label="My Profile"
          sub={complete ? "Ready for applications" : "Needs completion"}
          tone="from-blue-500/15 to-cyan-500/10"
        />
        <QuickLink
          to="/vacancies"
          icon={Briefcase}
          label="Browse Vacancies"
          sub="Find jobs"
          tone="from-amber-500/15 to-orange-500/10"
        />
        <QuickLink
          to="/applications"
          icon={Briefcase}
          label="My Applications"
          sub={`${applications.length} total`}
          tone="from-violet-500/15 to-fuchsia-500/10"
        />
        <QuickLink
          to="/notifications"
          icon={Bell}
          label="Notifications"
          sub={`${unreadCount} unread`}
          tone="from-emerald-500/15 to-teal-500/10"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-white via-white to-slate-50">
          <CardHeader
            title="Profile Snapshot"
            subtitle="A quick summary of the applicant information currently on file."
            action={
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <MapPinned className="h-4 w-4" />
                {complete ? "Updated" : "Needs attention"}
              </div>
            }
          />
          {profile ? (
            <div className="space-y-3">
              <SnapshotRow
                label="Current profession"
                value={profileSummary.profession}
              />
              <SnapshotRow
                label="Residence"
                value={profileSummary.residence || "Not added yet"}
              />
              <SnapshotRow
                label="Nationality"
                value={profileSummary.nationality}
              />
              <SnapshotRow
                label="Disability status"
                value={profileSummary.disability}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">
              No applicant profile has been created yet.
            </p>
          )}
          <Link
            to="/profile"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            Review profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="bg-gradient-to-br from-white via-white to-slate-50">
          <CardHeader
            title="Recent Applications"
            subtitle="A quick view of your most recent job applications."
          />
          {applications.length === 0 ? (
            <p className="text-sm text-muted">No applications yet.</p>
          ) : (
            <ul className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 last:mb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {app.vacancy?.title}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDateTime(app.applicationDate)}
                    </p>
                  </div>
                  <StatusBadge status={app.applicationStatus} />
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/applications"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <Card className="mt-8 bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader
          title="Quick Actions"
          subtitle="Common tasks to keep your application journey moving."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/5 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-4 w-4" /> Stay ready
            </div>
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Link to="/documents">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
            >
              <FileText className="h-4 w-4" /> Upload Documents
            </Button>
          </Link>
          <Link to="/vacancies">
            <Button
              variant="primary"
              className="w-full justify-start rounded-xl"
            >
              <Briefcase className="h-4 w-4" /> Browse Open Vacancies
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub, tone }) {
  return (
    <Link to={to}>
      <Card
        className={`group h-full bg-gradient-to-br ${tone} transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-primary shadow-sm ring-1 ring-slate-200/70">
              <Icon className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
              Workspace
            </span>
          </div>
          <div className="mt-8">
            <p className="text-lg font-semibold text-primary">{label}</p>
            <p className="mt-1 text-sm text-muted">{sub}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary/80 transition group-hover:gap-3 group-hover:text-primary">
              Open section
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
