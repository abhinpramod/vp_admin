

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
//   const { isAuth } = useAuth();
const isAuth = true; // Temporary hardcoded authentication status for testing
  return isAuth ? children : <Navigate to="/login" />;
}
