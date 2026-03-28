import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../api/api";
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, useMediaQuery, useTheme, Card, CardMedia, CardActions, IconButton,
  FormControlLabel, Switch, Typography, Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import toast from "react-hot-toast";
import imageCompression from 'browser-image-compression';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  
  const [formData, setFormData] = useState({ category: "", isPublished: true });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmToggle, setConfirmToggle] = useState({ open: false, id: null, currentStatus: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchItems = async () => {
    try {
      const res = await api.get("/gallery");
      setImages(res.data);
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!editingId && !file) newErrors.file = "Please select an image";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ category: "", isPublished: true });
    setFile(null);
    setErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (img) => {
    setEditingId(img._id);
    setFormData({ category: img.category || "", isPublished: img.isPublished !== false });
    setFile(null);
    setErrors({});
    setOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setUploading(true);
    try {
      if (editingId) {
        await api.put(`/gallery/${editingId}`, formData);
        toast.success("Image settings updated!");
      } else {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        const data = new FormData();
        data.append("image", compressedFile, file.name);
        data.append("category", formData.category);
        data.append("isPublished", formData.isPublished);

        await api.post("/gallery", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Image uploaded successfully!");
      }
      setOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gallery/${confirmDelete.id}`);
      toast.success("Image removed from gallery");
      fetchItems();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleTogglePublish = async () => {
    const { id, currentStatus } = confirmToggle;
    try {
      await api.put(`/gallery/${id}`, { isPublished: !currentStatus });
      toast.success(!currentStatus ? "Image Published!" : "Image Hidden");
      fetchItems();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Gallery</h2>
          <p className="text-gray-500 text-sm mt-1">Manage architectural inspiration images</p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<AddPhotoAlternateOutlinedIcon />} 
          onClick={handleOpenNew}
          fullWidth={isMobile}
          className="!bg-navy hover:!bg-navy-hover !text-white !rounded-xl !py-3 !px-8 !shadow-none !normal-case !font-semibold"
        >
          Add Image
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" /></div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <Card key={img._id} className={`!rounded-2xl shadow-sm border ${img.isPublished === false ? 'border-yellow-200 opacity-60' : 'border-gray-200 group transition hover:shadow-xl'} !bg-white relative`}>
              {img.isPublished === false && <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow z-10 uppercase tracking-widest border border-yellow-200">Hidden</div>}
              <CardMedia
                component="img"
                className="h-56 sm:h-48 lg:h-56 object-cover"
                image={`https://res.cloudinary.com/dyu8lsstq/image/upload/${img.publicId}`}
                alt="Gallery item"
              />
              <CardActions className="flex justify-between items-center p-3.5 bg-white flex-wrap gap-2">
                <span className="text-[11px] font-bold text-navy uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{img.category}</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Tooltip title={img.isPublished !== false ? "Hide from website" : "Show on website"}>
                    <Switch size="small" checked={img.isPublished !== false} onChange={() => setConfirmToggle({ open: true, id: img._id, currentStatus: img.isPublished !== false })} color="primary" />
                  </Tooltip>
                  <IconButton size="small" onClick={() => handleOpenEdit(img)} className="!text-gray-400 hover:!text-navy hover:!bg-gray-100">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setConfirmDelete({ open: true, id: img._id })} className="!text-gray-400 hover:!text-red-500 hover:!bg-red-50">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
              </CardActions>
            </Card>
          ))}
          {images.length === 0 && <p className="col-span-full text-center text-gray-400 py-20 font-medium italic">No gallery images found.</p>}
        </div>
      )}

      {/* Upload/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xs" 
        fullWidth 
        fullScreen={isMobile}
        PaperProps={{ 
          className: isMobile ? "" : "!rounded-[2.5rem] !shadow-2xl !border !border-gray-100",
          style: { background: "#fff" }
        }}
      >
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          
          <DialogTitle className={`!font-black ${isMobile ? '!text-xl !pt-8 !px-6' : '!text-2xl !pt-10 !px-8'} flex justify-between items-center bg-white`}>
            <div className="flex flex-col">
              <span className="text-navy tracking-tight">{editingId ? "Edit Image" : "Add Gallery File"}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mt-1">Inspiration & Design</span>
            </div>
            <IconButton 
              onClick={() => setOpen(false)} 
              size="small" 
              className="!bg-gray-50 hover:!bg-gray-100 !text-gray-400"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent className={`${isMobile ? '!px-6 !py-6' : '!px-8 !pt-4 !pb-2'} space-y-8`}>
            <Box className="flex justify-between items-center bg-navy/5 p-5 rounded-3xl border border-navy/10">
              <Box>
                <Typography variant="subtitle2" fontWeight="800" className="text-navy leading-tight">Public Visibility</Typography>
                <Typography variant="caption" className="text-gray-500 font-medium">Show in public gallery</Typography>
              </Box>
              <Switch 
                checked={formData.isPublished} 
                onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#0f1b2d' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0f1b2d' },
                }}
              />
            </Box>

            <TextField 
              label="Room / Space Type" 
              placeholder="e.g. Master Bedroom, Kitchen"
              fullWidth 
              value={formData.category} 
              onChange={(e) => { 
                  setFormData({...formData, category: e.target.value});
                  if (errors.category) setErrors({...errors, category: null});
              }} 
              error={!!errors.category}
              helperText={errors.category}
              variant="outlined"
              sx={{ 
                "& .MuiOutlinedInput-root": { 
                  borderRadius: "1.25rem",
                  backgroundColor: "#fcfcfc",
                  "&:hover fieldset": { borderColor: "#c9a96e" },
                  "&.Mui-focused fieldset": { borderColor: "#0f1b2d" }
                } 
              }}
            />

            {!editingId && (
              <Box>
                <div 
                  className={`group relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all flex flex-col justify-center cursor-pointer min-h-[220px] overflow-hidden ${errors.file ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gold'}`}
                  onClick={() => !file && document.getElementById('gallery-upload-input').click()}
                >
                  <input 
                    id="gallery-upload-input" 
                    type="file" 
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      if (errors.file) setErrors({...errors, file: null});
                    }} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  
                  {previewUrl ? (
                    <Box className="absolute inset-0 group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-navy/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center">
                        <Button 
                          variant="contained" 
                          size="small" 
                          className="!bg-white !text-navy !rounded-full !font-black !px-6 !mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('gallery-upload-input').click();
                          }}
                        >
                          Change Photo
                        </Button>
                        <Button 
                          variant="text" 
                          size="small" 
                          className="!text-white/80 !font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Box>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Box className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-navy/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28, color: '#c9a96e' }} />
                      </Box>
                      <div className="flex flex-col items-center px-6">
                          <span className="text-navy font-black">Upload Inspiration</span>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">High-Resolution Preferred</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.file && <Typography variant="caption" color="error" className="mt-3 block font-bold text-center italic">{errors.file}</Typography>}
              </Box>
            )}
          </DialogContent>
          <DialogActions className={`${isMobile ? '!px-6 !pb-8' : '!px-8 !pb-10'} !pt-4 flex flex-col gap-3`}>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={uploading} 
              fullWidth
              className={`!bg-navy hover:!bg-navy-hover !text-white !rounded-2xl !py-4 !shadow-xl !shadow-navy/20 !normal-case !font-black !text-base transition-all transform hover:-translate-y-0.5 active:scale-95 ${uploading ? 'opacity-70' : ''}`}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (editingId ? "Save Changes" : "Publish to Gallery")}
            </Button>
            <Button onClick={() => setOpen(false)} fullWidth className="!text-gray-400 !normal-case !font-black !py-2 hover:!bg-gray-50 !rounded-xl transition-all">
              Cancel
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Remove from Gallery?"
        message="This will delete this photo permanently. Are you sure?"
        danger
      />

      <ConfirmDialog 
        open={confirmToggle.open} 
        onClose={() => setConfirmToggle({ open: false, id: null, currentStatus: null })} 
        onConfirm={handleTogglePublish}
        title={confirmToggle.currentStatus ? "Hide Image?" : "Publish Image?"}
        message={confirmToggle.currentStatus ? "This photo will be hidden from the public gallery." : "This photo will become visible in the public gallery for todos."}
      />
    </AdminLayout>
  );
};

// Helper for tooltip wrapping - standard MUI Tooltip requires a forwardRef component or a simple element
const Tooltip = ({ children, title }) => (
    <div title={title} className="flex">{children}</div>
);

export default Gallery;
