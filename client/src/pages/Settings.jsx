import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../api/api";
import { 
  Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Paper, useMediaQuery, useTheme
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";

export default function Settings() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingId(category._id);
    setFormData({ name: category.name, description: category.description || "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        toast.success("Category updated");
      } else {
        await api.post("/categories", formData);
        toast.success("Category created");
      }
      setOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${confirmDelete.id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-light text-navy tracking-tight">Settings</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">System Configuration & Metadata</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Paper className="!rounded-3xl !shadow-sm !border !border-gray-100 overflow-hidden !bg-white">
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center bg-gray-50/30 gap-4">
              <div>
                <Typography variant="h6" fontWeight="900" className="text-navy tracking-tight leading-tight">Project Categories</Typography>
                <Typography variant="caption" className="text-gray-400 font-bold uppercase tracking-widest">Classification System</Typography>
              </div>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleOpenNew}
                className="!bg-navy hover:!bg-navy-hover !text-white !rounded-2xl !px-6 !py-2.5 !shadow-xl !shadow-navy/10 !normal-case !font-black !text-sm transition-all"
              >
                New Category
              </Button>
            </div>
            
            {loading ? (
              <div className="p-32 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold mx-auto" /></div>
            ) : categories.length === 0 ? (
              <div className="p-32 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <AssignmentIcon className="text-gray-200" />
                </div>
                <Typography className="text-gray-400 font-bold italic tracking-tight uppercase text-[10px]">No categories defined yet.</Typography>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead className="bg-gray-50/20">
                    <TableRow>
                      <TableCell className="!border-b-0 !text-gray-400 !text-[10px] !font-black !uppercase !tracking-[0.2em] !pl-8">Category Name</TableCell>
                      <TableCell className="!border-b-0 !text-gray-400 !text-[10px] !font-black !uppercase !tracking-[0.2em]">Context / Description</TableCell>
                      <TableCell align="right" className="!border-b-0 !text-gray-400 !text-[10px] !font-black !uppercase !tracking-[0.2em] !pr-8">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat._id} className="group hover:bg-navy/[0.02] transition-colors">
                        <TableCell className="!border-b !border-gray-50 !pl-8">
                          <Typography className="!font-black text-navy !text-base">{cat.name}</Typography>
                        </TableCell>
                        <TableCell className="!border-b !border-gray-50">
                          <Typography className="text-gray-500 text-sm font-medium">{cat.description || "—"}</Typography>
                        </TableCell>
                        <TableCell align="right" className="!border-b !border-gray-50 !pr-8">
                          <div className="flex justify-end gap-1">
                            <IconButton size="small" onClick={() => handleOpenEdit(cat)} className="!bg-white !shadow-sm !border !border-gray-100 hover:!bg-gold/10 hover:!text-gold transition-all">
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setConfirmDelete({ open: true, id: cat._id })} className="!bg-white !shadow-sm !border !border-gray-100 hover:!bg-red-50 hover:!text-red-500 transition-all">
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Paper>
        </div>

        <div className="space-y-6">
          <Paper className="p-8 !rounded-3xl !shadow-sm !border !border-gray-100 !bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
            <Typography variant="overline" className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4 block">Information</Typography>
            <Typography variant="body2" className="text-gray-500 leading-relaxed font-medium">
              Categories act as the primary organizational structure for your portfolio. They allow potential clients to filter your work by room type, architectural style, or project scale.
            </Typography>
            <div className="mt-6 flex items-center gap-3 p-4 bg-navy/5 rounded-2xl border border-navy/5">
               <div className="w-2 h-2 rounded-full bg-gold" />
               <Typography variant="caption" className="text-navy font-black text-[10px] uppercase tracking-widest text-opacity-70">Changes reflect instantly on site</Typography>
            </div>
          </Paper>
        </div>
      </div>

      {/* Add/Edit Dialog */}
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
              <span className="text-navy tracking-tight">{editingId ? "Edit Category" : "New Category"}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mt-1">Classification Management</span>
            </div>
            <IconButton 
              onClick={() => setOpen(false)} 
              size="small" 
              className="!bg-gray-50 hover:!bg-gray-100 !text-gray-400"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent className={`${isMobile ? '!px-6 !py-6' : '!space-y-6 !pt-4 !px-8 !pb-2'} space-y-6`}>
            <TextField 
              label="Category Name" 
              placeholder="e.g. Residential, Commercial"
              fullWidth 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
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
            <TextField 
              label="Brief Description (Optional)" 
              multiline 
              rows={4} 
              fullWidth 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What kind of projects fall under this category?"
              variant="outlined" 
              sx={{ 
                "& .MuiOutlinedInput-root": { 
                  borderRadius: "1.25rem",
                  backgroundColor: "#fcfcfc"
                } 
              }}
            />
          </DialogContent>

          <DialogActions className={`${isMobile ? '!px-6 !pb-8' : '!px-8 !pb-10'} !pt-6 flex flex-col gap-3`}>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={saving}
              fullWidth
              className={`!bg-navy hover:!bg-navy-hover !text-white !rounded-2xl !py-4 !shadow-xl !shadow-navy/20 !normal-case !font-black !text-base transition-all transform hover:-translate-y-0.5 active:scale-95 ${saving ? 'opacity-70' : ''}`}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (editingId ? "Update Category" : "Create Category")}
            </Button>
            <Button onClick={() => setOpen(false)} fullWidth className="!text-gray-400 !normal-case !font-black !py-2 hover:!bg-gray-50 !rounded-xl transition-all">
              Cancel
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} onConfirm={handleDelete}
        title="Delete Category?" message="This will remove the category. Existing projects using this category will still keep their label until updated." danger
      />
    </AdminLayout>
  );
}
