import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // wrong role
  if (!allowedRoles.includes(user.role_name)) {
    return <Navigate to="/patient" />;
  }

  // allowed
  return children;
}