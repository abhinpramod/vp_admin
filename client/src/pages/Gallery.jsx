import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import axios from "axios";
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, useMediaQuery, useTheme, Card, CardMedia, CardActions, IconButton 
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import toast from "react-hot-toast";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gallery", { withCredentials: true });
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

  const handleUpload = async () => {
    if (!file || !category) {
      toast.error("Please select an image and category");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    try {
      await axios.post("http://localhost:5000/api/gallery", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded!");
      setOpen(false);
      setFile(null);
      setCategory("");
      fetchItems();
    } catch (err) {
      toast.error("Upload failed. Please check file size/type.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/gallery/${id}`, { withCredentials: true });
      toast.success("Image removed");
      fetchItems();
    } catch (err) {
      toast.error("Delete failed");
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
          onClick={() => setOpen(true)}
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
            <Card key={img._id} className="!rounded-xl shadow-sm border border-gray-200 group transition hover:shadow-md !bg-white">
              <CardMedia
                component="img"
                className="h-56 sm:h-48 lg:h-56 object-cover"
                image={`https://res.cloudinary.com/dyu8lsstq/image/upload/${img.publicId}`}
                alt="Gallery item"
              />
              <CardActions className="flex justify-between p-3 bg-white border-t border-gray-100">
                <span className="text-xs font-medium text-gray-700 tracking-wide px-2">{img.category}</span>
                <IconButton size="small" onClick={() => handleDelete(img._id)} className="!text-gray-400 hover:!text-red-500 hover:!bg-red-50 focus:!text-red-500">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
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
        <DialogTitle className="!font-medium !text-xl !text-gray-900 !pb-2">Add Inspiration File</DialogTitle>
        <DialogContent dividers className="space-y-4 !pt-5">
          <TextField 
            label="Room/Category" 
            fullWidth 
            margin="none" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            variant="outlined"
            size="small"
          />
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
        </DialogContent>
        <DialogActions className="!px-6 !py-4 !bg-gray-50/50">
          <Button onClick={() => setOpen(false)} className="!text-gray-500 !normal-case">Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!file || !category || uploading} 
            className="!bg-gray-900 hover:!bg-black !text-white !rounded-lg !px-6 !shadow-none !normal-case !font-medium"
          >
            {uploading ? "Uploading..." : "Publish"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Gallery;
