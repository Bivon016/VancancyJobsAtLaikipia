import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import Button from '../ui/Button';

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/applications', label: 'My Applications', icon: Briefcase },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export default function ApplicantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="relative hidden w-64 flex-shrink-0 bg-primary-dark text-white md:block">
        <div className="p-6">
          <p className="font-heading text-sm font-bold text-accent">Applicant Portal</p>
          <p className="mt-1 truncate text-xs text-white/60">{user?.email}</p>
        </div>
        <nav className="space-y-1 px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/70 hover:bg-white/5 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
          <p className="font-heading text-sm font-bold text-primary">Applicant Portal</p>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} className="whitespace-nowrap text-xs text-primary">
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
