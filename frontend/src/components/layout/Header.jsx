import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { isAdminRole } from '../../utils/roles';
import Button from '../ui/Button';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-white/90 hover:text-white'}`;

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-primary-dark text-white">
      <div className="kenya-stripe" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent font-heading text-lg font-bold text-primary-dark">
            L
          </div>
          <div>
            <p className="font-heading text-sm font-bold leading-tight md:text-base">
              Laikipia County
            </p>
            <p className="text-xs text-white/70">Public Service Board</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/vacancies" className={navLinkClass}>
            Vacancies
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to={isAdminRole(user?.role) ? '/admin' : '/dashboard'}
                className="hidden text-sm text-white/90 hover:text-white sm:block"
              >
                Dashboard
              </Link>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="accent" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
