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
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";

const menuItems = [
  { text: "Overview", icon: <DashboardIcon />, path: "/admin" },
  { text: "Projects", icon: <WorkIcon />, path: "/admin/projects" },
  { text: "Gallery", icon: <CollectionsIcon />, path: "/admin/gallery" },
];

const AdminNavbar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)} 
        className="md:hidden"
        PaperProps={{ className: "!w-72 !rounded-r-xl !shadow-2xl !bg-[#0f172a] !text-white" }}
      >
        <SidebarContent close={() => setOpen(false)} handleLogout={handleLogout} />
      </Drawer>

      <div className="hidden md:block w-72 h-screen sticky top-0 bg-[#0f172a] border-r border-slate-800 text-white shadow-xl z-20">
        <SidebarContent handleLogout={handleLogout} />
      </div>
    </>
  );
};

const SidebarContent = ({ close, handleLogout }) => (
  <div className="h-full flex flex-col p-6">
    <div className="mb-12 px-2 mt-2">
      <Typography variant="h6" fontWeight="700" className="text-white tracking-widest uppercase text-sm">
        VP Interiors
      </Typography>
      <Typography variant="caption" className="text-slate-400 uppercase tracking-[0.2em] block mt-1 text-[10px]">
        Administration
      </Typography>
    </div>

    <List className="flex-1 space-y-2">
      {menuItems.map((item) => (
        <NavLink key={item.text} to={item.path} onClick={close} end>
          {({ isActive }) => (
            <ListItemButton
              className={`!rounded-lg transition-all duration-300 py-3 ${
                isActive 
                  ? "bg-slate-800 !text-white shadow-lg border border-slate-700" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <ListItemIcon className={isActive ? "!text-white" : "!text-slate-400"}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={<span className={`tracking-wide text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.text}</span>} 
              />
            </ListItemButton>
          )}
        </NavLink>
      ))}
    </List>

    <div className="mt-auto pt-6 border-t border-slate-800">
      <ListItemButton className="!rounded-lg text-slate-400 hover:bg-slate-800/50 py-3 transition-colors" onClick={handleLogout}>
        <ListItemIcon className="!text-slate-400"><ExitToAppIcon /></ListItemIcon>
        <ListItemText primary={<span className="font-medium text-sm tracking-wide">Logout</span>} />
      </ListItemButton>
    </div>
  </div>
);

export default AdminNavbar;
