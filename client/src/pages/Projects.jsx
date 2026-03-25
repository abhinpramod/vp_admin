import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import axios from "axios";
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Card, CardContent, Typography, useMediaQuery, useTheme 
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [formData, setFormData] = useState({ title: "", category: "", totalCost: "", duration: "", description: "" });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/services", { withCredentials: true });
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

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      toast.error("Please fill in title and category");
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("totalCost", formData.totalCost);
    data.append("duration", formData.duration);
    data.append("description", formData.description);
    data.append("materials", JSON.stringify([]));

    for (let i = 0; i < files.length; i++) {
        data.append("images", files[i]);
    }

    try {
      await axios.post("http://localhost:5000/api/services", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Project created successfully!");
      setOpen(false);
      fetchProjects();
      setFormData({ title: "", category: "", totalCost: "", duration: "", description: "" });
      setFiles([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/services/${id}`, { withCredentials: true });
      toast.success("Project deleted");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Projects</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your design portfolio</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
          fullWidth={isMobile}
          className="!bg-gray-900 hover:!bg-black !text-white !rounded-lg !py-2.5 !px-5 !shadow-none !normal-case !font-medium"
        >
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>
      ) : isMobile ? (
        <div className="space-y-4">
          {projects.map((p) => (
            <Card key={p._id} className="!rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Typography variant="h6" fontWeight="500" className="text-gray-900 leading-tight">{p.title}</Typography>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-medium uppercase tracking-wider rounded mt-1">{p.category}</span>
                  </div>
                  <IconButton color="error" size="small" onClick={() => handleDelete(p._id)} className="!text-gray-400 hover:!text-red-500 hover:!bg-red-50">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-medium tracking-wide">Estimate</p>
                    <p className="font-regular text-gray-800">₹{p.totalCost}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-medium tracking-wide">Timeline</p>
                    <p className="font-regular text-gray-800">{p.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && <p className="text-center text-gray-400 py-20 font-medium">No projects available.</p>}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <Table>
            <TableHead className="bg-gray-50/80">
              <TableRow>
                <TableCell className="!text-gray-500 !text-xs !font-medium !uppercase !tracking-wider">Title</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-medium !uppercase !tracking-wider">Category</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-medium !uppercase !tracking-wider">Estimate Cost</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-medium !uppercase !tracking-wider">Duration</TableCell>
                <TableCell align="right" className="!text-gray-500 !text-xs !font-medium !uppercase !tracking-wider">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p._id} hover className="transition-colors">
                  <TableCell className="!text-gray-900 !font-medium">{p.title}</TableCell>
                  <TableCell><span className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-medium uppercase tracking-wider rounded">{p.category}</span></TableCell>
                  <TableCell className="!text-gray-700">₹{p.totalCost}</TableCell>
                  <TableCell className="!text-gray-700">{p.duration}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleDelete(p._id)} className="!text-gray-400 hover:!text-red-600 hover:!bg-red-50 transition-colors">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" className="py-20 text-gray-400">No records found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ className: "!rounded-xl" }}
      >
        <DialogTitle className="!font-medium !text-xl !text-gray-900 !pb-2">New Portfolio Project</DialogTitle>
        <DialogContent dividers className="space-y-5 !pt-5">
          <TextField 
            label="Project Title" 
            fullWidth 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            variant="outlined"
            size="small"
          />
          <div className="flex flex-col sm:flex-row gap-5">
            <TextField 
              label="Category (e.g., Residential)" 
              fullWidth 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              variant="outlined"
              size="small"
            />
            <TextField 
              label="Total Cost (₹)" 
              type="number" 
              fullWidth 
              value={formData.totalCost} 
              onChange={e => setFormData({...formData, totalCost: e.target.value})} 
              variant="outlined"
              size="small"
            />
          </div>
          <TextField 
            label="Timeline/Duration (e.g., 2 Months)" 
            fullWidth 
            value={formData.duration} 
            onChange={e => setFormData({...formData, duration: e.target.value})} 
            variant="outlined"
            size="small"
          />
          <TextField 
            label="Project Description" 
            multiline 
            rows={4} 
            fullWidth 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            variant="outlined"
          />
          
          <div className="border border-dashed border-gray-300 p-6 rounded-lg text-center hover:bg-gray-50 transition-colors cursor-pointer group">
            <label className="cursor-pointer block w-full h-full">
              <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="hidden" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                  {files.length > 0 ? `${files.length} images selected` : "Browse files to upload"}
                </span>
                <span className="text-xs text-gray-400">High-resolution project photos</span>
              </div>
            </label>
          </div>
        </DialogContent>
        <DialogActions className="!px-6 !py-4 !bg-gray-50/50">
          <Button onClick={() => setOpen(false)} className="!text-gray-500 !normal-case">Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving || !formData.title} 
            className="!bg-gray-900 hover:!bg-black !text-white !rounded-lg !px-6 !shadow-none !normal-case !font-medium"
          >
            {saving ? "Publishing..." : "Publish Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Projects;
