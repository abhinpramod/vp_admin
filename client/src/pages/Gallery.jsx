import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api/api";
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, useMediaQuery, useTheme, Card, CardMedia, CardActions, IconButton,
  FormControlLabel, Switch
} from "@mui/material";
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ category: "", isPublished: true });
    setFile(null);
    setOpen(true);
  };

  const handleOpenEdit = (img) => {
    setEditingId(img._id);
    setFormData({ category: img.category || "", isPublished: img.isPublished !== false });
    setFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.category) {
      toast.error("Please enter a category");
      return;
    }
    setUploading(true);

    try {
      if (editingId) {
        await api.put(`/gallery/${editingId}`, formData);
        toast.success("Image updated!");
      } else {
        if (!file) {
          toast.error("Please select an image");
          setUploading(false);
          return;
        }

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        const data = new FormData();
        data.append("image", compressedFile);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success("Image removed");
      fetchItems();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
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
          className="!bg-gray-900 hover:!bg-black !text-white !rounded-lg !py-2.5 !px-5 !shadow-none !normal-case !font-medium"
        >
          Add Image
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <Card key={img._id} className={`!rounded-xl shadow-sm border ${img.isPublished === false ? 'border-yellow-300 opacity-60 grayscale-[50%]' : 'border-gray-200 group transition hover:shadow-md'} !bg-white relative`}>
              {img.isPublished === false && <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 uppercase tracking-widest">Hidden</div>}
              <CardMedia
                component="img"
                className="h-56 sm:h-48 lg:h-56 object-cover"
                image={`https://res.cloudinary.com/dyu8lsstq/image/upload/${img.publicId}`}
                alt="Gallery item"
              />
              <CardActions className="flex justify-between items-center p-3 bg-white border-t border-gray-100 flex-wrap gap-2">
                <span className="text-xs font-medium text-gray-700 tracking-wide px-1">{img.category}</span>
                <div className="flex bg-gray-50 rounded-lg p-0.5 border border-gray-100 ml-auto">
                  <FormControlLabel 
                    control={<Switch size="small" checked={img.isPublished !== false} onChange={() => handleTogglePublish(img._id, img.isPublished !== false)} />} 
                    label="" 
                    className="!mr-0 !ml-1"
                  />
                  <IconButton size="small" onClick={() => handleOpenEdit(img)} className="!text-gray-400 hover:!text-gray-900">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(img._id)} className="!text-gray-400 hover:!text-red-500">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
              </CardActions>
            </Card>
          ))}
          {images.length === 0 && <p className="col-span-full text-center text-gray-400 py-20 font-medium">No images found.</p>}
        </div>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xs" 
        fullWidth 
        PaperProps={{ className: "!rounded-xl" }}
      >
        <DialogTitle className="!font-medium !text-xl !text-gray-900 !pb-2">{editingId ? "Edit Image Settings" : "Add Inspiration File"}</DialogTitle>
        <DialogContent dividers className="space-y-4 !pt-5">
           <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-900 tracking-wide block">Visibility</span>
            </div>
            <FormControlLabel 
              control={<Switch checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} />} 
              label={<span className="text-xs uppercase font-bold tracking-wider text-gray-900">{formData.isPublished ? "Live" : "Hidden"}</span>} 
            />
          </div>

          <TextField 
            label="Room/Category" 
            fullWidth 
            margin="none" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            variant="outlined"
            size="small"
          />

          {!editingId && (
            <div className="border border-dashed border-gray-300 p-8 rounded-lg text-center bg-gray-50/50 hover:bg-gray-50 transition-all group flex flex-col justify-center cursor-pointer">
              <label className="cursor-pointer block w-full h-full">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="image/*" />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                    {file ? file.name : "Browse design files"}
                  </span>
                </div>
              </label>
            </div>
          )}
        </DialogContent>
        <DialogActions className="!px-6 !py-4 !bg-gray-50/50">
          <Button onClick={() => setOpen(false)} className="!text-gray-500 !normal-case">Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={(!file && !editingId) || !formData.category || uploading} 
            className="!bg-gray-900 hover:!bg-black !text-white !rounded-lg !px-6 !shadow-none !normal-case !font-medium"
          >
            {uploading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Gallery;
