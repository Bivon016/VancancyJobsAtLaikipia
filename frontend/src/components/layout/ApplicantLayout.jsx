import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import Button from "../ui/Button";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/applications", label: "My Applications", icon: Briefcase },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function ApplicantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/60">
      <aside className="relative hidden w-72 flex-shrink-0 border-r border-white/10 bg-primary-dark text-white md:block">
        <div className="border-b border-white/10 p-6">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Applicant Portal
          </p>
          <p className="mt-3 truncate text-sm font-semibold text-white">
            {user?.email}
          </p>
          <p className="mt-1 text-xs text-white/60">
            Track applications and manage your profile
          </p>
        </div>
        <nav className="space-y-2 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-72 p-4">
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
        <header className="border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur md:hidden">
          <p className="font-heading text-sm font-bold text-primary">
            Applicant Portal
          </p>
          <nav className="mt-2 flex gap-3 overflow-x-auto text-xs">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="whitespace-nowrap text-primary"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
