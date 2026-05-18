import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps role-specific routes.
 * @param {string[]} allowedRoles — array of roles allowed to access this route
 * @param {React.ReactNode} children — the page component
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Authenticated but wrong role — redirect to their own dashboard
    return <Navigate to="/" replace />;
  }

  return children;
}
