import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  FileSpreadsheet,
  Shield,
  Sparkles,
  Users,
  FileText,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLE_LABELS } from "../../utils/roles";

const ROLE_LINKS = {
  SUPER_ADMIN: [
    {
      to: "/admin/users",
      label: "Manage system users",
      icon: Users,
      tone: "from-blue-500/15 to-cyan-500/10",
    },
    {
      to: "/admin/departments",
      label: "Manage departments",
      icon: Shield,
      tone: "from-emerald-500/15 to-teal-500/10",
    },
    {
      to: "/admin/recruitment",
      label: "View recruitment requests",
      icon: ClipboardCheck,
      tone: "from-violet-500/15 to-fuchsia-500/10",
    },
    {
      to: "/admin/vacancies",
      label: "Manage vacancies",
      icon: Briefcase,
      tone: "from-amber-500/15 to-orange-500/10",
    },
    {
      to: "/admin/applications",
      label: "View applications report",
      icon: FileSpreadsheet,
      tone: "from-sky-500/15 to-blue-500/10",
    },
    {
      to: "/admin/shortlists",
      label: "View shortlist report",
      icon: Users,
      tone: "from-pink-500/15 to-rose-500/10",
    },
    {
      to: "/admin/assessments",
      label: "Pre-screening assessments",
      icon: FileText,
      tone: "from-emerald-500/15 to-teal-500/10",
    },
    {
      to: "/admin/interviews",
      label: "View interviews",
      icon: CalendarDays,
      tone: "from-indigo-500/15 to-blue-500/10",
    },
    {
      to: "/admin/selections",
      label: "View final selections",
      icon: Sparkles,
      tone: "from-purple-500/15 to-pink-500/10",
    },
  ],
  CPSB_ADMIN: [
    {
      to: "/admin/recruitment",
      label: "Review recruitment requests",
      icon: ClipboardCheck,
      tone: "from-violet-500/15 to-fuchsia-500/10",
    },
    {
      to: "/admin/vacancies",
      label: "Create & manage vacancies",
      icon: Briefcase,
      tone: "from-amber-500/15 to-orange-500/10",
    },
    {
      to: "/admin/assessments",
      label: "Pre-screening assessments",
      icon: FileText,
      tone: "from-emerald-500/15 to-teal-500/10",
    },
    {
      to: "/admin/selections",
      label: "Final selection reports",
      icon: Sparkles,
      tone: "from-purple-500/15 to-pink-500/10",
    },
  ],
  DEPT_HEAD: [
    {
      to: "/admin/recruitment",
      label: "Submit recruitment requests",
      icon: ClipboardCheck,
      tone: "from-violet-500/15 to-fuchsia-500/10",
    },
  ],
  HR_OFFICER: [
    {
      to: "/admin/applications",
      label: "Review applications (PDF)",
      icon: FileSpreadsheet,
      tone: "from-sky-500/15 to-blue-500/10",
    },
    {
      to: "/admin/shortlists",
      label: "Manage shortlists (PDF)",
      icon: Users,
      tone: "from-pink-500/15 to-rose-500/10",
    },
    {
      to: "/admin/assessments",
      label: "Pre-screening assessments",
      icon: FileText,
      tone: "from-emerald-500/15 to-teal-500/10",
    },
    {
      to: "/admin/interviews",
      label: "Schedule interviews",
      icon: CalendarDays,
      tone: "from-indigo-500/15 to-blue-500/10",
    },
    {
      to: "/admin/selections",
      label: "View selections (PDF)",
      icon: Sparkles,
      tone: "from-purple-500/15 to-pink-500/10",
    },
  ],
  PANEL_MEMBER: [
    {
      to: "/admin/assessments",
      label: "Review assessments",
      icon: FileText,
      tone: "from-emerald-500/15 to-teal-500/10",
    },
    {
      to: "/admin/interviews",
      label: "My assigned interviews",
      icon: CalendarDays,
      tone: "from-indigo-500/15 to-blue-500/10",
    },
  ],
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const links = ROLE_LINKS[role] || [];

  return (
    <div>
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Staff workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-secondary">
          Staff Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {ROLE_LABELS[role]} — Laikipia County Public Service Board
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {links.map(({ to, label, icon: Icon, tone }) => (
          <Link key={to} to={to}>
            <Card
              className={`group h-full min-h-[180px] bg-gradient-to-br ${tone} transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]`}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-secondary shadow-sm ring-1 ring-slate-200/70">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
                    Module
                  </span>
                </div>
                <div className="mt-8">
                  <p className="text-lg font-semibold leading-7 text-secondary">
                    {label}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary/80 transition group-hover:gap-3 group-hover:text-secondary">
                    Open workspace
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-white via-slate-50 to-white">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-heading text-lg font-bold text-secondary">
              Official PDF Records
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Bulk reports for shortlists, applications, interviews, and
              selections are available as downloadable PDF documents for
              official record-keeping and printing.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
