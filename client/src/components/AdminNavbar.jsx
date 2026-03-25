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
import axios from "axios";

const menuItems = [
  { text: "Overview", icon: <DashboardIcon />, path: "/admin" },
  { text: "Projects", icon: <WorkIcon />, path: "/admin/projects" },
  { text: "Gallery", icon: <CollectionsIcon />, path: "/admin/gallery" },
];

const AdminNavbar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
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
        PaperProps={{ className: "!w-72 !rounded-r-xl !shadow-xl" }}
      >
        <SidebarContent close={() => setOpen(false)} handleLogout={handleLogout} />
      </Drawer>

      <div className="hidden md:block w-72 h-screen sticky top-0 bg-white border-r border-gray-200">
        <SidebarContent handleLogout={handleLogout} />
      </div>
    </>
  );
};

const SidebarContent = ({ close, handleLogout }) => (
  <div className="h-full flex flex-col p-6">
    <div className="mb-12 px-2">
      <Typography variant="h6" fontWeight="600" className="text-gray-900 tracking-wide uppercase text-sm">
        VP Interiors
      </Typography>
      <Typography variant="caption" className="text-gray-400 uppercase tracking-[0.2em] block mt-1 text-[10px]">
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
                  ? "bg-gray-900 !text-white shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ListItemIcon className={isActive ? "!text-white" : "!text-gray-400"}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={<span className={`tracking-wide text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>{item.text}</span>} 
              />
            </ListItemButton>
          )}
        </NavLink>
      ))}
    </List>

    <div className="mt-auto pt-6 border-t border-gray-200">
      <ListItemButton className="!rounded-lg text-gray-500 hover:bg-gray-50 py-3 transition-colors" onClick={handleLogout}>
        <ListItemIcon className="!text-gray-400"><ExitToAppIcon /></ListItemIcon>
        <ListItemText primary={<span className="font-normal text-sm tracking-wide">Logout</span>} />
      </ListItemButton>
    </div>
  </div>
);

export default AdminNavbar;
