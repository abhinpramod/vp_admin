import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Services from "./pages/Services";
import Layout from "./components/Layout";
import Gallery from "./pages/Gallery";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AddService from "./pages/AddService";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import EditProject from "./pages/EditProject";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Layout>
                  <Services />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/projects/:id" element={<Layout><ProjectDetails /></Layout>} />

<Route
  path="/edit-project/:id"
  element={
    <ProtectedRoute>
      <Layout>
        <EditProject />
      </Layout>
    </ProtectedRoute>
  }
/>


          <Route
  path="/add-service"
  element={
    <ProtectedRoute>
      <Layout>
        <AddService />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/projects"
  element={
    <Layout>
      <Projects />
    </Layout>
  }
/>


          <Route
  path="/gallery"
  element={
    <ProtectedRoute>
      <Layout>
        <Gallery />
      </Layout>
    </ProtectedRoute>
  }
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
