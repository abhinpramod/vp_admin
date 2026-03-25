import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../api/api";
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Card, CardContent, Typography, useMediaQuery, useTheme,
  FormControlLabel, Switch, Box, Tooltip
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";
import imageCompression from 'browser-image-compression';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [formData, setFormData] = useState({ title: "", category: "", totalCost: "", duration: "", description: "", isPublished: true });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmToggle, setConfirmToggle] = useState({ open: false, id: null, currentStatus: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

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

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.totalCost || Number(formData.totalCost) <= 0) newErrors.totalCost = "Enter a valid cost";
    if (!editingId && (!files || files.length === 0)) newErrors.files = "Select at least one image";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ title: "", category: "", totalCost: "", duration: "", description: "", isPublished: true });
    setFiles([]);
    setErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingId(project._id);
    setFormData({ 
      title: project.title || "", 
      category: project.category || "", 
      totalCost: project.totalCost || "", 
      duration: project.duration || "", 
      description: project.description || "",
      isPublished: project.isPublished !== false 
    });
    setFiles([]);
    setErrors({});
    setOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("totalCost", formData.totalCost);
    data.append("duration", formData.duration);
    data.append("description", formData.description);
    data.append("isPublished", formData.isPublished);

    if (!editingId) data.append("materials", JSON.stringify([]));

    if (files && files.length > 0) {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      for (let i = 0; i < files.length; i++) {
        const compressedFile = await imageCompression(files[i], options);
        data.append("images", compressedFile, files[i].name);
      }
    }

    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Project updated!");
      } else {
        await api.post("/services", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Project published!");
      }
      setOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

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
          onClick={handleOpenNew}
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
            <Card key={p._id} className="!rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
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
                    <IconButton size="small" onClick={() => handleOpenEdit(p)} className="hover:!bg-gray-100">
                      <EditOutlinedIcon fontSize="small" className="text-gray-400" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setConfirmDelete({ open: true, id: p._id })} className="hover:!bg-red-50">
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
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Title</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Cost & Duration</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Visibility</TableCell>
                <TableCell align="right" className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p._id} hover>
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
                      control={<Switch size="small" checked={p.isPublished !== false} onChange={() => setConfirmToggle({ open: true, id: p._id, currentStatus: p.isPublished !== false })} />} 
                      label={<span className={`text-[10px] uppercase font-bold tracking-widest ${p.isPublished !== false ? 'text-green-600' : 'text-gray-300'}`}>{p.isPublished !== false ? "Live" : "Hidden"}</span>} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Project">
                      <IconButton size="small" onClick={() => handleOpenEdit(p)} className="hover:!bg-gray-100 mr-2">
                        <EditOutlinedIcon fontSize="small" className="text-gray-400" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setConfirmDelete({ open: true, id: p._id })} className="hover:!bg-red-50">
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: "!rounded-3xl" }}>
        <DialogTitle className="!font-bold !text-xl !pt-6">{editingId ? "Edit Project" : "New Portfolio Project"}</DialogTitle>
        <DialogContent dividers className="space-y-6 !pt-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <Typography variant="body2" fontWeight="700" className="text-navy tracking-tight">Active Visibility</Typography>
              <Typography variant="caption" className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Public Site Status</Typography>
            </div>
            <Switch checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} />
          </div>

          <TextField 
            label="Project Title" fullWidth value={formData.title} 
            onChange={e => { setFormData({...formData, title: e.target.value}); if(errors.title) setErrors({...errors, title: null}); }} 
            error={!!errors.title} helperText={errors.title}
            variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <TextField 
                label="Category" fullWidth value={formData.category} 
                onChange={e => { setFormData({...formData, category: e.target.value}); if(errors.category) setErrors({...errors, category: null}); }} 
                error={!!errors.category} helperText={errors.category}
                variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField 
                label="Total Cost (₹)" type="number" fullWidth value={formData.totalCost} 
                onChange={e => { setFormData({...formData, totalCost: e.target.value}); if(errors.totalCost) setErrors({...errors, totalCost: null}); }} 
                error={!!errors.totalCost} helperText={errors.totalCost}
                variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </div>

          <TextField 
            label="Timeline/Duration (e.g., 2 Months)" fullWidth value={formData.duration} 
            onChange={e => setFormData({...formData, duration: e.target.value})} 
            variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <TextField 
            label="Project Description" multiline rows={4} fullWidth value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            variant="outlined" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          
          <Box>
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-gray-50/50 hover:bg-gray-50 ${errors.files ? 'border-red-300' : 'border-gray-200 hover:border-gold'} cursor-pointer`}>
                <label className="cursor-pointer block w-full h-full">
                  <input type="file" multiple onChange={(e) => { setFiles(e.target.files); if(errors.files) setErrors({...errors, files: null}); }} className="hidden" accept="image/*" />
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-navy font-bold leading-tight">
                      {files && files.length > 0 ? `${files.length} images selected` : editingId ? "Select new photos to override" : "Drop project photos here"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Architecture / Interior Shots</span>
                  </div>
                </label>
              </div>
              {errors.files && <Typography variant="caption" color="error" className="mt-1 block ml-2 font-medium">{errors.files}</Typography>}
          </Box>

          {previewUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {previewUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className="!px-8 !py-6">
          <Button onClick={() => setOpen(false)} className="!text-gray-500 !normal-case !font-semibold">Cancel</Button>
          <Button 
            onClick={handleSave} variant="contained" disabled={saving} 
            className="!bg-navy hover:!bg-navy-hover !text-white !rounded-xl !px-10 !py-2.5 !shadow-none !normal-case !font-semibold"
          >
            {saving ? "Saving..." : (editingId ? "Save Changes" : "Publish Project")}
          </Button>
        </DialogActions>
      </Dialog>

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
