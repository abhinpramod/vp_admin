import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import api from "../api/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if(res.data.success){
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 font-sans">
      <Card className="w-full max-w-md shadow-sm border border-gray-200 !rounded-xl !bg-white">
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-full mb-4 border border-gray-100">
              <LockOutlinedIcon className="text-gray-800" />
            </div>
            <Typography variant="h6" fontWeight="600" className="text-gray-900 tracking-wide uppercase text-center text-sm">
              VP Interiors
            </Typography>
            <Typography variant="caption" className="text-gray-400 mt-1 uppercase tracking-widest text-xs">
              Administration
            </Typography>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-md mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{ className: "!rounded-lg" }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{ className: "!rounded-lg" }}
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="!bg-gray-900 hover:!bg-black !text-white !rounded-lg !py-3 !shadow-none !normal-case !font-medium !text-base transition-colors"
                disableElevation
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
