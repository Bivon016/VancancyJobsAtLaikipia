import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isAdminRole, isApplicant, normalizeRole } from '../utils/roles';

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length) {
    const userRole = normalizeRole(user?.role);
    if (!roles.includes(userRole)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}

export function ApplicantRoute({ children }) {
  const { user } = useAuth();
  if (!isApplicant(user?.role)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!isAdminRole(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return (
      <Navigate
        to={isAdminRole(user?.role) ? '/admin' : '/dashboard'}
        replace
      />
    );
  }
  return children;
}
