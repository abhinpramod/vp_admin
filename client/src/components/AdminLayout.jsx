import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f1", display: "flex", fontFamily: "Inter, sans-serif" }}>
      <AdminNavbar open={open} setOpen={setOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile Top Bar */}
        <div
          className="md:hidden"
          style={{
            background: "#0f1b2d",
            borderBottom: "1px solid rgba(201,169,110,0.2)",
            padding: "12px 16px",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <IconButton
            onClick={() => setOpen(true)}
            size="small"
            style={{ color: "#c9a96e", padding: "4px" }}
          >
            <MenuIcon />
          </IconButton>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            color: "#fff",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            VP Interiors
          </span>
        </div>

        {/* Main Content */}
        <main style={{ padding: "32px 24px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}
          className="sm:p-10 lg:p-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
