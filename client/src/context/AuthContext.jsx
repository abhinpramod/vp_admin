import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Verify token on every mount/refresh
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setIsAuth(res.data.success === true);
      } catch {
        setIsAuth(false);
      } finally {
        setAuthLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = () => setIsAuth(true);
  const logout = () => setIsAuth(false);

  return (
    <AuthContext.Provider value={{ isAuth, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
