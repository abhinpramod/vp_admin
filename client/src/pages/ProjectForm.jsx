import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { 
  Button, TextField, Typography, Box, Grid, 
  FormControl, InputLabel, Select, MenuItem, Switch,
  IconButton, Paper, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CollectionsIcon from "@mui/icons-material/Collections";
import toast from "react-hot-toast";
import imageCompression from 'browser-image-compression';

const CLOUD_NAME = "dyu8lsstq";
const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img}`;
};

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: "", category: "", totalCost: "", 
    duration: "", description: "", isPublished: true 
  });
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (id) fetchProject();
  }, [id]);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  const fetchProject = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      const p = res.data;
      setFormData({ 
        title: p.title || "", 
        category: p.category || "", 
        totalCost: p.totalCost || "", 
        duration: p.duration || "", 
        description: p.description || "",
        isPublished: p.isPublished !== false 
      });
      setExistingImages(p.images || []);
    } catch (err) {
      toast.error("Failed to load project details");
      navigate("/admin/projects");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.totalCost || Number(formData.totalCost) <= 0) newErrors.totalCost = "Enter a valid cost";
    if (!id && (!files || files.length === 0)) newErrors.files = "Select at least one image";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (!id) data.append("materials", JSON.stringify([]));

    if (files && files.length > 0) {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      for (let i = 0; i < files.length; i++) {
        try {
          const compressedFile = await imageCompression(files[i], options);
          data.append("images", compressedFile, files[i].name);
        } catch (e) {
          data.append("images", files[i]);
        }
      }
    }

    try {
      if (id) {
        await api.put(`/services/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Project updated successfully");
      } else {
        await api.post("/services", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Project published successfully");
      }
      navigate("/admin/projects");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4" />
          <Typography className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Assembling Workspace...</Typography>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Sticky Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 sticky top-0 bg-gray-50/80 backdrop-blur-md py-6 z-50 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-4">
            <IconButton onClick={() => navigate("/admin/projects")} className="!bg-white !shadow-sm !border !border-gray-100 hover:!bg-navy hover:!text-white transition-all">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tighter italic">
                {id ? "Refine Project" : "New Portfolio Project"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-[2.5px] bg-gold rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold leading-none">Curation Studio</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <Button 
                onClick={() => navigate("/admin/projects")} 
                className="!text-gray-400 !normal-case !font-black !px-6 !py-3 hover:!bg-gray-100 !rounded-2xl transition-all flex-1 sm:flex-none tracking-widest uppercase text-[10px]"
             >
                Discard
             </Button>
             <Button 
                onClick={handleSave} 
                variant="contained" 
                disabled={saving}
                startIcon={saving ? null : <SaveIcon />}
                className={`!bg-navy hover:!bg-navy-hover !text-white !rounded-2xl !px-10 !py-3.5 !shadow-xl !shadow-navy/20 !normal-case !font-black !text-sm transition-all transform hover:-translate-y-1 active:scale-95 flex-1 sm:flex-none ${saving ? 'opacity-70' : ''}`}
             >
                {saving ? "Publishing..." : (id ? "Update Project" : "Publish Project")}
             </Button>
          </div>
        </div>

        <Grid container spacing={6}>
          {/* Main Form Section */}
          <Grid item xs={12} lg={7} className="space-y-8">
            <Paper className="!rounded-[2.5rem] !p-10 !shadow-sm !border !border-gray-100 bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-navy/[0.01] rounded-full -mr-32 -mt-32 blur-3xl" />
               
               <Typography variant="overline" className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-8 block">Architecture & Context</Typography>
               
               <div className="space-y-8 relative z-10">
                  <TextField 
                    label="Project Identity / Title" fullWidth value={formData.title} 
                    onChange={e => { setFormData({...formData, title: e.target.value}); if(errors.title) setErrors({...errors, title: null}); }} 
                    error={!!errors.title} helperText={errors.title}
                    placeholder="e.g. Minimalist Coastal Villa"
                    variant="outlined" 
                    sx={{ 
                      "& .MuiOutlinedInput-root": { 
                        borderRadius: "1.5rem",
                        backgroundColor: "#fcfcfc",
                        "& fieldset": { borderColor: "rgba(15, 27, 45, 0.08)" },
                        "&:hover fieldset": { borderColor: "#c9a96e" },
                        "&.Mui-focused fieldset": { borderColor: "#0f1b2d", borderWidth: "2px" }
                      }
                    }}
                  />

                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.category} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1.5rem", backgroundColor: "#fcfcfc", "& fieldset": { borderColor: "rgba(15, 27, 45, 0.08)" } } }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={formData.category}
                          label="Category"
                          onChange={e => { setFormData({...formData, category: e.target.value}); if(errors.category) setErrors({...errors, category: null}); }}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat._id} value={cat.name} className="!py-4 !px-6 !text-sm !font-black !text-navy hover:!bg-navy/5">{cat.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Project Valuation (₹)" type="number" fullWidth value={formData.totalCost} 
                        onChange={e => { setFormData({...formData, totalCost: e.target.value}); if(errors.totalCost) setErrors({...errors, totalCost: null}); }} 
                        error={!!errors.totalCost} helperText={errors.totalCost}
                        variant="outlined" 
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1.5rem", backgroundColor: "#fcfcfc", "& fieldset": { borderColor: "rgba(15, 27, 45, 0.08)" } } }}
                      />
                    </Grid>
                  </Grid>

                  <TextField 
                    label="Completion Period" placeholder="e.g. 8 Months | Q4 2023" fullWidth value={formData.duration} 
                    onChange={e => setFormData({...formData, duration: e.target.value})} 
                    variant="outlined" 
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "1.5rem", backgroundColor: "#fcfcfc", "& fieldset": { borderColor: "rgba(15, 27, 45, 0.08)" } } }}
                  />

                  <TextField 
                    label="Design Narrative" multiline rows={8} fullWidth value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Describe the architectural language and spatial philosophy..."
                    variant="outlined" 
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "2rem", backgroundColor: "#fcfcfc", padding: "8px", "& fieldset": { borderColor: "rgba(15, 27, 45, 0.08)" } } }}
                  />
               </div>
            </Paper>

            {/* Publication Stage */}
            <Paper className="!rounded-[2.5rem] !p-8 !shadow-sm !border !border-navy !bg-navy relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
               <div className="flex flex-col sm:flex-row justify-between items-center relative z-10">
                  <Box className="mb-4 sm:mb-0 text-center sm:text-left">
                    <Typography variant="h6" fontWeight="900" className="text-white leading-tight flex items-center justify-center sm:justify-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${formData.isPublished ? 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`} />
                      Publication Status
                    </Typography>
                    <Typography variant="caption" className="text-white/40 font-bold uppercase tracking-widest text-[9px] mt-1 block">
                      {formData.isPublished ? "Visible to the public digital domain" : "Saved as an internal draft"}
                    </Typography>
                  </Box>
                  <Switch 
                    checked={formData.isPublished} 
                    onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                    sx={{
                      '& .MuiSwitch-switchBase': { color: '#fff' },
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#c9a96e' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#c9a96e' },
                      '& .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  />
               </div>
            </Paper>
          </Grid>

          {/* Media Section */}
          <Grid item xs={12} lg={5} className="space-y-8">
            <Paper className="!rounded-[2.5rem] !p-10 !shadow-sm !border !border-gray-100 bg-white">
               <Typography variant="overline" className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-8 block">Visual Assets</Typography>
               
               <div 
                 className={`group relative overflow-hidden border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all duration-500 bg-gray-50/50 hover:bg-white ${errors.files ? 'border-red-300' : 'border-gray-100 hover:border-gold hover:shadow-2xl hover:shadow-navy/5' } cursor-pointer min-h-[300px] flex flex-col items-center justify-center`}
                 onClick={() => document.getElementById('project-file-input').click()}
               >
                 <input id="project-file-input" type="file" multiple onChange={(e) => { setFiles(prev => [...prev, ...Array.from(e.target.files)]); if(errors.files) setErrors({...errors, files: null}); }} className="hidden" accept="image/*" />
                 
                 <Box className="w-16 h-16 rounded-2xl bg-navy text-white shadow-2xl shadow-navy/20 flex items-center justify-center mb-6 group-hover:rotate-12 transition-all duration-500">
                   <AddIcon sx={{ fontSize: 32 }} />
                 </Box>
                 <Typography variant="h6" fontWeight="900" className="text-navy mb-2 tracking-tight leading-none">High-Resolution Media</Typography>
                 <Typography variant="caption" className="text-gray-400 font-bold uppercase tracking-widest text-[9px] block mt-2">Maximum 10MB per unit</Typography>
                 
                 {files.length > 0 && (
                    <div className="absolute top-4 right-4 bg-gold text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-lg">
                       {files.length} New Selections
                    </div>
                 )}
               </div>
               {errors.files && <Typography variant="caption" color="error" className="mt-4 block font-black text-center italic tracking-tight">{errors.files}</Typography>}

               {/* Previews */}
               {(previewUrls.length > 0 || existingImages.length > 0) && (
                 <div className="mt-10 space-y-6">
                    <Divider className="opacity-10" />
                    <Typography variant="caption" className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">Current Stack</Typography>
                    
                    <div className="grid grid-cols-3 gap-6">
                       {previewUrls.map((url, i) => (
                         <div key={`new-${i}`} className="relative group aspect-square rounded-2xl overflow-hidden shadow-md border border-gray-100">
                           <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <IconButton 
                               size="small" 
                               className="!bg-white !text-red-500 hover:!bg-red-500 hover:!text-white transition-all transform hover:rotate-90"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setFiles(prev => Array.from(prev).filter((_, index) => index !== i));
                               }}
                             >
                               <CloseIcon sx={{ fontSize: 16 }} />
                             </IconButton>
                           </div>
                         </div>
                       ))}
                       {id && !previewUrls.length && existingImages.map((url, i) => (
                         <div key={`old-${i}`} className="relative aspect-square rounded-2xl overflow-hidden grayscale opacity-40 border border-navy/5">
                           <img src={resolveImageUrl(url)} alt="" className="w-full h-full object-cover shrink-0" />
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </AdminLayout>
  );
};

export default ProjectForm;
