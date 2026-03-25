import React, { cloneElement, useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { useMediaQuery, useTheme, Grid, Paper, Box, Typography } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGalleryItems: 0,
    totalApplications: 0,
    revenue: "₹0"
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        // Also fetch application count
        const appRes = await api.get("/applications");
        setStats({
            ...res.data,
            totalApplications: appRes.data.length
        });
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
      <div className="mb-12">
        <h2 className="text-3xl font-light text-navy tracking-tight">Overview</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Key Performance Metrics</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
        </div>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Projects" value={stats.totalProjects} icon={<WorkOutlineIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Gallery" value={stats.totalGalleryItems} icon={<CollectionsOutlinedIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Enquiries" value={stats.totalApplications} icon={<AssignmentOutlinedIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Revenue" value={stats.revenue} icon={<PaymentsOutlinedIcon />} />
          </Grid>
        </Grid>
      )}

      {/* Greeting card / Welcome */}
      <Box className="mt-12 bg-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
                <Typography variant="h4" fontWeight="300" className="tracking-tight mb-2">Welcome Back, Admin</Typography>
                <Typography variant="body2" className="text-gray-400 font-medium max-w-md">
                    Manage your interior design business with precision. Update your portfolio, gallery, or respond to new enquiries.
                </Typography>
            </div>
            <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20 backdrop-blur-sm">
                <Typography variant="caption" className="text-gold uppercase font-bold tracking-[0.2em] block mb-1">Status</Typography>
                <Typography variant="h6" className="font-bold">System Active</Typography>
            </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-gold opacity-5 rounded-full" />
        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-white opacity-5 rounded-full" />
      </Box>
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon }) => (
  <Paper 
    elevation={0}
    className="!rounded-3xl border border-gray-200 p-8 hover:shadow-xl transition-all group !bg-white"
  >
    <Box className="flex justify-between items-start mb-6">
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 group-hover:bg-gold/10 group-hover:border-gold/20 transition-colors">
            {cloneElement(icon, { style: { color: '#c9a96e', fontSize: '28px' } })}
        </div>
        <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{title}</span>
            <span className="text-3xl font-light text-navy tracking-tighter mt-1">{value}</span>
        </div>
    </Box>
    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
        <div className="w-2/3 h-full bg-navy group-hover:bg-gold transition-colors" />
    </div>
  </Paper>
);

export default Dashboard;
