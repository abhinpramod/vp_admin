import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Applications from "./pages/Applications";
import Settings from "./pages/Settings";
import ProjectForm from "./pages/ProjectForm";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Shows spinner while verifying auth status
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
  </div>
);

// Redirects to /admin if already logged in (prevents back-button to login)
const PublicRoute = ({ children }) => {
  const { isAuth, authLoading } = useAuth();
  if (authLoading) return <AuthLoader />;
  return isAuth ? <Navigate to="/admin" replace /> : children;
};

// Redirects to / if not logged in
const ProtectedRoute = ({ children }) => {
  const { isAuth, authLoading } = useAuth();
  if (authLoading) return <AuthLoader />;
  return isAuth ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              iconTheme: { primary: "#a78bfa", secondary: "#1e293b" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#1e293b" },
            },
          }}
        />
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects/new"
            element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects/edit/:id"
            element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
