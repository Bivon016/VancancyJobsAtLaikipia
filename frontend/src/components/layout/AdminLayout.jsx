import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLES, ROLE_LABELS } from "../../utils/roles";
import Button from "../ui/Button";

const ALL_LINKS = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    roles: Object.values(ROLES).filter((r) => r !== ROLES.APPLICANT),
  },
  {
    to: "/admin/users",
    label: "User Management",
    icon: UserCog,
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    to: "/admin/departments",
    label: "Departments",
    icon: Building2,
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    to: "/admin/recruitment",
    label: "Recruitment",
    icon: ClipboardList,
    roles: [ROLES.SUPER_ADMIN, ROLES.CPSB_ADMIN, ROLES.DEPT_HEAD],
  },
  {
    to: "/admin/vacancies",
    label: "Vacancies",
    icon: ClipboardList,
    roles: [ROLES.SUPER_ADMIN, ROLES.CPSB_ADMIN],
  },
  {
    to: "/admin/applications",
    label: "Applications",
    icon: Users,
    roles: [ROLES.SUPER_ADMIN, ROLES.HR_OFFICER, ROLES.CPSB_ADMIN],
  },
  {
    to: "/admin/shortlists",
    label: "Shortlists",
    icon: Users,
    roles: [ROLES.SUPER_ADMIN, ROLES.HR_OFFICER, ROLES.CPSB_ADMIN],
  },
  {
    to: "/admin/interviews",
    label: "Interviews",
    icon: Calendar,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HR_OFFICER,
      ROLES.CPSB_ADMIN,
      ROLES.PANEL_MEMBER,
    ],
  },
  {
    to: "/admin/interviews/online",
    label: "Online Interviews",
    icon: Calendar,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HR_OFFICER,
      ROLES.CPSB_ADMIN,
      ROLES.PANEL_MEMBER,
    ],
  },
  {
    to: "/admin/selections",
    label: "Final Selection",
    icon: Star,
    roles: [ROLES.SUPER_ADMIN, ROLES.CPSB_ADMIN, ROLES.HR_OFFICER],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);

  const links = ALL_LINKS.filter((l) => l.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/50">
      <aside className="sticky top-0 hidden h-screen w-72 flex-shrink-0 flex-col border-r border-white/10 bg-secondary text-white lg:flex">
        <div className="border-b border-white/10 p-6">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Staff Portal
          </p>
          <p className="mt-3 text-sm font-semibold text-white">
            {ROLE_LABELS[role]}
          </p>
          <p className="mt-1 truncate text-xs text-white/60">{user?.email}</p>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-secondary shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start rounded-xl text-white/75 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-heading text-sm font-bold text-secondary">
            Staff Portal — {ROLE_LABELS[role]}
          </p>
          <nav className="mt-2 flex gap-3 overflow-x-auto text-xs">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="whitespace-nowrap text-secondary"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
