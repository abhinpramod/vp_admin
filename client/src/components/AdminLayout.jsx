import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import { IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-gray-900">
      <AdminNavbar open={open} setOpen={setOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile) */}
        <div className="md:hidden bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconButton onClick={() => setOpen(true)} className="!text-gray-900 !p-1">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="600" className="text-gray-900 tracking-wide uppercase text-sm">
              VP Interiors
            </Typography>
          </div>
        </div>

        <main className="p-4 sm:p-8 lg:p-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
