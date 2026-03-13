import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Route guard that checks role-based access before rendering.
 * Redirects unauthorized users to Dashboard with a denied flag.
 *
 * Security: This prevents direct URL navigation to restricted pages.
 * The Layout sidebar hides links, but this component blocks actual access.
 */
export default function ProtectedRoute({ path, children }) {
  const { canAccess, user } = useAuth();

  // If user is loaded and doesn't have access, redirect to dashboard
  if (user && !canAccess(path)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
