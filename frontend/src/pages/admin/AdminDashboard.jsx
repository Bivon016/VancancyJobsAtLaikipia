import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLE_LABELS } from "../../utils/roles";

const ROLE_LINKS = {
  SUPER_ADMIN: [
    { to: "/admin/users", label: "Manage system users" },
    { to: "/admin/departments", label: "Manage departments" },
    { to: "/admin/recruitment", label: "View recruitment requests" },
    { to: "/admin/vacancies", label: "Manage vacancies" },
    { to: "/admin/applications", label: "View applications report" },
    { to: "/admin/shortlists", label: "View shortlist report" },
    { to: "/admin/interviews", label: "View interviews" },
    { to: "/admin/selections", label: "View final selections" },
  ],
  CPSB_ADMIN: [
    { to: "/admin/recruitment", label: "Review recruitment requests" },
    { to: "/admin/vacancies", label: "Create & manage vacancies" },
    { to: "/admin/selections", label: "Final selection reports" },
  ],
  DEPT_HEAD: [
    { to: "/admin/recruitment", label: "Submit recruitment requests" },
  ],
  HR_OFFICER: [
    { to: "/admin/applications", label: "Review applications (PDF)" },
    { to: "/admin/shortlists", label: "Manage shortlists (PDF)" },
    { to: "/admin/interviews", label: "Schedule interviews" },
    { to: "/admin/selections", label: "View selections (PDF)" },
  ],
  PANEL_MEMBER: [{ to: "/admin/interviews", label: "My assigned interviews" }],
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const links = ROLE_LINKS[role] || [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Staff Dashboard
      </h1>
      <p className="mt-1 text-muted">
        {ROLE_LABELS[role]} — Laikipia County Public Service Board
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {links.map(({ to, label }) => (
          <Link key={to} to={to}>
            <Card className="transition-shadow hover:shadow-md">
              <p className="font-semibold text-secondary">{label}</p>
              <p className="mt-1 text-sm text-muted">Open →</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <p className="text-sm text-muted">
          Bulk reports (shortlists, applications, selections) are displayed as
          downloadable PDF documents for official record-keeping and printing.
        </p>
      </Card>
    </div>
  );
}
