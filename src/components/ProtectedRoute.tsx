import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/data/mockData";

interface ProtectedRouteProps {
  allowedRole: UserRole;
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== allowedRole) return <Navigate to="/login" replace />;

  return <Outlet />;
}
