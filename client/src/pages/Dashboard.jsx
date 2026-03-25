import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { useMediaQuery, useTheme } from "@mui/material";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGalleryItems: 0,
    revenue: "₹0"
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Key metrics for your portfolio.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Projects" value={stats.totalProjects} isMobile={isMobile} />
          <StatCard title="Gallery Images" value={stats.totalGalleryItems} isMobile={isMobile} />
          <StatCard title="Total Revenue" value={stats.revenue} isMobile={isMobile} />
        </div>
      )}
    </AdminLayout>
  );
};

const StatCard = ({ title, value, isMobile }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col justify-center hover:shadow-md transition-shadow">
    <p className="text-gray-500 font-medium mb-3 uppercase tracking-widest text-[10px] sm:text-xs">{title}</p>
    <p className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-light text-gray-900 tracking-tight`}>{value}</p>
  </div>
);

export default Dashboard;
