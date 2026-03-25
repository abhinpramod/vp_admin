import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import CollectionsIcon from "@mui/icons-material/Collections";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";
import { useState } from "react";

const menuItems = [
  { text: "Overview", icon: <DashboardIcon />, path: "/admin" },
  { text: "Projects", icon: <WorkIcon />, path: "/admin/projects" },
  { text: "Gallery", icon: <CollectionsIcon />, path: "/admin/gallery" },
  { text: "Applications", icon: <AssignmentIcon />, path: "/admin/applications" },
];

const AdminNavbar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        className="md:hidden"
        PaperProps={{
          style: {
            width: "272px",
            borderRadius: "0 20px 20px 0",
            background: "#0f1b2d",
            color: "#fff",
            boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
          },
        }}
      >
        <SidebarContent close={() => setOpen(false)} handleLogout={() => setShowLogoutConfirm(true)} />
      </Drawer>

      <div
        style={{
          width: "272px",
          minWidth: "272px",
          background: "#0f1b2d",
          color: "#fff",
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
          zIndex: 20,
        }}
        className="hidden md:flex"
      >
        <SidebarContent handleLogout={() => setShowLogoutConfirm(true)} />
      </div>

      <ConfirmDialog 
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        message="Are you sure you want to exit the admin dashboard?"
      />
    </>
  );
};

const SidebarContent = ({ close, handleLogout }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 20px" }}>
    {/* Logo */}
    <div style={{ marginBottom: "36px", paddingLeft: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#c9a96e", boxShadow: "0 0 8px #c9a96e88"
        }} />
        <Typography style={{
          fontFamily: "Inter, sans-serif", fontWeight: 700,
          fontSize: "15px", color: "#fff", letterSpacing: "0.12em",
          textTransform: "uppercase"
        }}>
          VP Interiors
        </Typography>
      </div>
      <Typography style={{
        fontFamily: "Inter, sans-serif", fontSize: "10px",
        color: "#c9a96e", letterSpacing: "0.22em",
        textTransform: "uppercase", paddingLeft: "18px"
      }}>
        Administration
      </Typography>
    </div>

    {/* Divider */}
    <div style={{ height: "1px", background: "rgba(201,169,110,0.15)", marginBottom: "24px" }} />

    {/* Nav items */}
    <List style={{ flex: 1, padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
      {menuItems.map((item) => (
        <NavLink key={item.text} to={item.path} onClick={close} end>
          {({ isActive }) => (
            <ListItemButton
              style={{
                borderRadius: "10px",
                padding: "10px 14px",
                background: isActive ? "rgba(201,169,110,0.12)" : "transparent",
                borderLeft: isActive ? "3px solid #c9a96e" : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
              sx={{
                "&:hover": {
                  background: "rgba(201,169,110,0.08) !important",
                  borderLeft: "3px solid rgba(201,169,110,0.5) !important",
                }
              }}
            >
              <ListItemIcon style={{ minWidth: "36px", color: isActive ? "#c9a96e" : "#8099b8" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#fff" : "#94a8c0",
                    letterSpacing: "0.01em",
                  }}>
                    {item.text}
                  </span>
                }
              />
            </ListItemButton>
          )}
        </NavLink>
      ))}
    </List>

    {/* Divider */}
    <div style={{ height: "1px", background: "rgba(201,169,110,0.15)", margin: "16px 0" }} />

    {/* Logout */}
    <ListItemButton
      onClick={handleLogout}
      style={{ borderRadius: "10px", padding: "10px 14px" }}
      sx={{
        "&:hover": {
          background: "rgba(220,38,38,0.1) !important",
          "& span": { color: "#f87171 !important" },
          "& .MuiListItemIcon-root": { color: "#f87171 !important" },
        }
      }}
    >
      <ListItemIcon style={{ minWidth: "36px", color: "#6b7280", transition: "color 0.2s" }}>
        <ExitToAppIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <span style={{
            fontFamily: "Inter, sans-serif", fontSize: "13.5px",
            fontWeight: 400, color: "#6b7280", transition: "color 0.2s"
          }}>
            Logout
          </span>
        }
      />
    </ListItemButton>
  </div>
);

export default AdminNavbar;
