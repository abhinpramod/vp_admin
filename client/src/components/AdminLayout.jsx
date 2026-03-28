import AdminNavbar from "./AdminNavbar";
import { BottomNavigation, BottomNavigationAction, Paper, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import CollectionsIcon from "@mui/icons-material/Collections";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react"; 


const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", icon: <DashboardIcon />, path: "/admin" },
    { label: "Work", icon: <WorkIcon />, path: "/admin/projects" },
    { label: "Gallery", icon: <CollectionsIcon />, path: "/admin/gallery" },
    { label: "Apps", icon: <AssignmentIcon />, path: "/admin/applications" },
    { label: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
  ];

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
            padding: "16px 20px",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            color: "#fff",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            VP Interiors
          </span>
        </div>

        {/* Main Content */}
        <main 
          style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", paddingBottom: "100px" }}
          className="p-6 sm:p-10 lg:p-12"
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 50,
            display: { md: 'none' },
            borderTop: '1px solid rgba(201,169,110,0.1)',
            background: '#fff'
          }} 
          elevation={10}
        >
          <BottomNavigation
            showLabels
            value={navItems.findIndex(item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)))}
            onChange={(event, newValue) => {
              navigate(navItems[newValue].path);
            }}
            sx={{
              height: 70,
              '& .Mui-selected': {
                '& .MuiBottomNavigationAction-label': {
                   fontSize: '10px',
                   fontWeight: 800,
                   color: '#0f1b2d',
                   marginTop: '4px'
                },
                '& .MuiSvgIcon-root': {
                  color: '#c9a96e',
                  transform: 'scale(1.1)',
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '10px',
                fontWeight: 600,
                color: '#94a8c0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              },
              '& .MuiSvgIcon-root': {
                color: '#94a8c0',
              }
            }}
          >
            {navItems.map((item, index) => (
              <BottomNavigationAction 
                key={index}
                label={item.label} 
                icon={item.icon} 
              />
            ))}
          </BottomNavigation>
        </Paper>
      </div>
    </div>
  );
};

export default AdminLayout;
