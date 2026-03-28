import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../api/api";
import { 
  Button, Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Card, CardContent, Typography, useMediaQuery, useTheme,
  FormControlLabel, Switch, Box, Tooltip, Dialog, DialogContent, DialogActions
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import toast from "react-hot-toast";

const CLOUD_NAME = "dyu8lsstq";
const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img}`;
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmToggle, setConfirmToggle] = useState({ open: false, id: null, currentStatus: null });
  const [viewProject, setViewProject] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/services");
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${confirmDelete.id}`);
      toast.success("Project deleted");
      fetchProjects();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleTogglePublish = async () => {
    const { id, currentStatus } = confirmToggle;
    try {
      const data = new FormData();
      data.append("isPublished", !currentStatus);
      await api.put(`/services/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(!currentStatus ? "Project Published!" : "Project Hidden");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Projects</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and publish your design portfolio</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate("/admin/projects/new")}
          fullWidth={isMobile}
          className="!bg-navy hover:!bg-navy-hover !text-white !rounded-xl !py-3 !px-8 !shadow-none !normal-case !font-semibold"
        >
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-300">
           <Typography className="text-gray-400 font-medium italic">No projects available.</Typography>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {projects.map((p) => (
            <Card key={p._id} onClick={() => { setViewProject(p); setCarouselIndex(0); }} className="!rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow">
              {p.images && p.images.length > 0 && (
                <img src={resolveImageUrl(p.images[0])} alt={p.title} className="w-full h-36 object-cover" />
              )}
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Typography variant="h6" fontWeight="700" className="text-navy leading-tight flex items-center gap-2">
                      {p.title}
                      {p.isPublished === false && <span className="text-[9px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-lg uppercase font-bold tracking-widest border border-yellow-200">Hidden</span>}
                    </Typography>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-md mt-2 border border-gray-200">{p.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/admin/projects/edit/${p._id}`); }} className="hover:!bg-gray-100">
                      <EditOutlinedIcon fontSize="small" className="text-gray-400" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: p._id }); }} className="hover:!bg-red-50">
                      <DeleteOutlineIcon fontSize="small" className="text-red-400" />
                    </IconButton>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-gray-50 pt-4">
                  <div>
                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Est. Cost</p>
                    <p className="font-bold text-navy">₹{Number(p.totalCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mb-1 text-right">Visibility</p>
                    <div className="flex justify-end">
                      <Switch size="small" checked={p.isPublished !== false} onChange={() => setConfirmToggle({ open: true, id: p._id, currentStatus: p.isPublished !== false })} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <Table>
            <TableHead className="bg-gray-50/50">
              <TableRow>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest !w-16">Photo</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Title</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Cost & Duration</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Visibility</TableCell>
                <TableCell align="right" className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p._id} hover onClick={() => { setViewProject(p); setCarouselIndex(0); }} className="cursor-pointer">
                  <TableCell>
                    {p.images && p.images.length > 0 ? (
                      <img src={resolveImageUrl(p.images[0])} alt={p.title} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 text-xs">No img</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-navy">{p.title}</p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{p.category}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-gray-700">₹{Number(p.totalCost || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{p.duration || 'No duration set'}</p>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel 
                      control={<Switch size="small" checked={p.isPublished !== false} onChange={(e) => { e.stopPropagation(); setConfirmToggle({ open: true, id: p._id, currentStatus: p.isPublished !== false }); }} onClick={(e) => e.stopPropagation()} />} 
                      label={<span className={`text-[10px] uppercase font-bold tracking-widest ${p.isPublished !== false ? 'text-green-600' : 'text-gray-300'}`}>{p.isPublished !== false ? "Live" : "Hidden"}</span>} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Project">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/admin/projects/edit/${p._id}`); }} className="hover:!bg-gray-100 mr-2">
                        <EditOutlinedIcon fontSize="small" className="text-gray-400" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: p._id }); }} className="hover:!bg-red-50">
                        <DeleteOutlineIcon fontSize="small" className="text-red-400" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Project Detail Dialog ── */}
      {viewProject && (
        <Dialog 
          open={!!viewProject} 
          onClose={() => setViewProject(null)} 
          maxWidth="md" 
          fullWidth 
          PaperProps={{ className: "!rounded-3xl !overflow-hidden" }}
        >
          {/* Image Carousel */}
          {viewProject.images && viewProject.images.length > 0 && (
            <div className="relative bg-gray-900" style={{ height: 300 }}>
              <img
                src={resolveImageUrl(viewProject.images[carouselIndex])}
                alt={viewProject.title}
                className="w-full h-full object-cover opacity-90"
              />
              {/* Navigation arrows */}
              {viewProject.images.length > 1 && (
                <>
                  <IconButton
                    onClick={() => setCarouselIndex(i => (i - 1 + viewProject.images.length) % viewProject.images.length)}
                    className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !bg-black/40 !text-white hover:!bg-black/60"
                    size="small"
                  >
                    <ArrowBackIosNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => setCarouselIndex(i => (i + 1) % viewProject.images.length)}
                    className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !bg-black/40 !text-white hover:!bg-black/60"
                    size="small"
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {viewProject.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Close button overlay */}
              <IconButton
                onClick={() => setViewProject(null)}
                className="!absolute !top-3 !right-3 !bg-black/40 !text-white hover:!bg-black/60"
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${
                  viewProject.isPublished !== false 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-yellow-400/90 text-yellow-900'
                }`}>
                  {viewProject.isPublished !== false ? 'Live' : 'Hidden'}
                </span>
              </div>
            </div>
          )}

          <DialogContent className="!p-8">
            {/* Title + category */}
            <div className="mb-6">
              <Typography variant="h5" fontWeight="800" className="text-navy tracking-tight leading-tight">
                {viewProject.title}
              </Typography>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-md border border-gray-200">
                {viewProject.category}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Estimated Cost</p>
                <p className="text-xl font-black text-navy">₹{Number(viewProject.totalCost || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Duration</p>
                <p className="text-xl font-black text-navy">{viewProject.duration || '—'}</p>
              </div>
            </div>

            {/* Description */}
            {viewProject.description && (
              <div className="mb-2">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{viewProject.description}</p>
              </div>
            )}
          </DialogContent>

          <DialogActions className="!px-8 !pb-8 !pt-0 flex gap-2">
            <Button 
              onClick={() => setViewProject(null)} 
              className="!text-gray-500 !normal-case !font-semibold"
            >
              Close
            </Button>
            <div className="flex-1" />
            <Button
              onClick={() => { setViewProject(null); setConfirmDelete({ open: true, id: viewProject._id }); }}
              startIcon={<DeleteOutlineIcon />}
              className="!text-red-500 !normal-case !font-semibold !border !border-red-200 !rounded-xl !px-5"
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
            <Button
              onClick={() => { const p = viewProject; setViewProject(null); navigate(`/admin/projects/edit/${p._id}`); }}
              startIcon={<EditOutlinedIcon />}
              variant="contained"
              className="!bg-navy hover:!bg-navy-hover !text-white !rounded-xl !px-6 !shadow-none !normal-case !font-semibold"
            >
              Edit Project
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ConfirmDialog 
        open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete Project?" message="This will remove the project from your public portfolio." danger
      />

      <ConfirmDialog 
        open={confirmToggle.open} 
        onClose={() => setConfirmToggle({ open: false, id: null, currentStatus: null })} 
        onConfirm={handleTogglePublish}
        title={confirmToggle.currentStatus ? "Hide Project?" : "Publish Project?"}
        message={confirmToggle.currentStatus ? "This project will be hidden from the public website." : "This project will become visible on your public website."}
      />
    </AdminLayout>
  );
};

export default Projects;
