import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        login();
        toast.success("Welcome back! 👋");
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }} />

      {/* Glass card */}
      <div className="relative w-full max-w-md mx-4"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>

        <div className="p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
              }}>
              <LockOutlinedIcon style={{ color: "#fff", fontSize: 28 }} />
            </div>
            <h1 className="font-bold text-white text-2xl tracking-tight">VP Interiors</h1>
            <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email field */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <EmailOutlinedIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: errors.email ? "#f87171" : "#94a3b8", fontSize: 20 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                  placeholder="admin@vpinteriors.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${errors.email ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
                    boxShadow: errors.email ? "0 0 0 3px rgba(248,113,113,0.1)" : "none",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid rgba(124,58,237,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                  onBlur={e => { e.target.style.border = `1px solid ${errors.email ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`; e.target.style.boxShadow = errors.email ? "0 0 0 3px rgba(248,113,113,0.1)" : "none"; }}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.email}</p>}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${errors.password ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
                    boxShadow: errors.password ? "0 0 0 3px rgba(248,113,113,0.1)" : "none",
                  }}
                  onFocus={e => { e.target.style.border = "1px solid rgba(124,58,237,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                  onBlur={e => { e.target.style.border = `1px solid ${errors.password ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`; e.target.style.boxShadow = errors.password ? "0 0 0 3px rgba(248,113,113,0.1)" : "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  tabIndex={-1}>
                  {showPassword
                    ? <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                    : <VisibilityOutlinedIcon style={{ fontSize: 20 }} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{
                background: loading ? "rgba(124,58,237,0.6)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: loading ? "none" : "0 8px 24px rgba(124,58,237,0.35)",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              {loading
                ? <><CircularProgress size={18} sx={{ color: "white" }} /> Signing in...</>
                : "Sign In to Dashboard"}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-8">
            VP Interiors Administration Panel · Secure Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
