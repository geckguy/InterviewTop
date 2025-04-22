// src/components/PrivateRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const loc = useLocation();
  return isAuthenticated
    ? children
    : <Navigate to="/signin" state={{ from: loc }} replace />;
}
