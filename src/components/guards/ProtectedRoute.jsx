import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// ── ProtectedRoute ────────────────────────────────────────────
// Redirects to login if not authenticated
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── GuestRoute ────────────────────────────────────────────────
// Redirects to dashboard if already logged in
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// ── AdminRoute ────────────────────────────────────────────────
// Only SUPER_ADMIN can access
export function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

// ── OrgAdminRoute ─────────────────────────────────────────────
// Only ORG_ADMIN or SUPER_ADMIN can access
export function OrgAdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ORG_ADMIN" && user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default ProtectedRoute;
