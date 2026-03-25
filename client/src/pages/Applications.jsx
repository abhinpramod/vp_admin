import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../api/api";
import { 
  Button, Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Card, CardContent, Typography, useMediaQuery, useTheme,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Tooltip, Badge
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined";
import toast from "react-hot-toast";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCarouselBuilder, setShowCarouselBuilder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmStatus, setConfirmStatus] = useState({ open: false, id: null, status: null });
  const [tempCarousel, setTempCarousel] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await api.get("/gallery");
      setGallery(res.data.filter(img => img.isPublished !== false));
    } catch (err) {
      console.error("Gallery fetch error:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchGallery();
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/applications/${confirmDelete.id}`);
      toast.success("Application removed");
      fetchApplications();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const updateStatus = async () => {
    const { id, status } = confirmStatus;
    try {
      await api.put(`/applications/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchApplications();
      if (selectedApp?._id === id) setSelectedApp({ ...selectedApp, status });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const saveCarousel = async () => {
    if (tempCarousel.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    try {
      await api.put(`/applications/${selectedApp._id}`, { carouselImages: tempCarousel });
      toast.success("Carousel updated successfully!");
      setShowCarouselBuilder(false);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to save carousel");
    }
  };

  const statusColors = {
    Pending: { bg: "#fffbeb", text: "#d97706", label: "Pending" },
    Reviewed: { bg: "#eff6ff", text: "#2563eb", label: "Reviewed" },
    Approved: { bg: "#f0fdf4", text: "#16a34a", label: "Approved" },
    Rejected: { bg: "#fef2f2", text: "#dc2626", label: "Rejected" },
  };

  const toggleGalleryImage = (publicId) => {
    setTempCarousel(prev => 
      prev.includes(publicId) 
        ? prev.filter(id => id !== publicId) 
        : [...prev, publicId]
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Applications</h2>
          <p className="text-gray-500 text-sm mt-1">Manage user enquiries and create custom carousels</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-300">
          <Typography className="text-gray-400 font-medium">No applications found yet.</Typography>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id} className="!rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Typography variant="subtitle1" fontWeight="600" className="text-gray-900 leading-tight">
                      {app.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500 block">{app.email}</Typography>
                  </div>
                  <Chip 
                    label={app.status} 
                    size="small"
                    style={{ 
                      backgroundColor: statusColors[app.status].bg, 
                      color: statusColors[app.status].text,
                      fontWeight: 700,
                      fontSize: '10px',
                      textTransform: 'uppercase'
                    }} 
                  />
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    fullWidth 
                    size="small" 
                    variant="outlined" 
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => { setSelectedApp(app); setShowDetail(true); }}
                    className="!rounded-lg !text-gray-600 !border-gray-200 !normal-case !text-xs"
                  >
                    View
                  </Button>
                  <IconButton 
                    size="small" 
                    onClick={() => setConfirmDelete({ open: true, id: app._id })}
                    className="!text-red-400 hover:!bg-red-50"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
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
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">User</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Contact</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Status</TableCell>
                <TableCell className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Carousel</TableCell>
                <TableCell align="right" className="!text-gray-500 !text-xs !font-bold !uppercase !tracking-widest">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id} hover>
                  <TableCell>
                    <p className="font-semibold text-gray-900">{app.name}</p>
                    <p className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-700">{app.email}</p>
                    <p className="text-xs text-gray-400">{app.phone || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={app.status} 
                      size="small"
                      style={{ 
                        backgroundColor: statusColors[app.status].bg, 
                        color: statusColors[app.status].text,
                        fontWeight: 700,
                        fontSize: '9px',
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    {app.carouselImages?.length > 0 ? (
                      <Badge badgeContent={app.carouselImages.length} color="primary" sx={{ "& .MuiBadge-badge": { backgroundColor: "#c9a96e" } }}>
                        <div className="flex -space-x-2">
                          {app.carouselImages.slice(0, 3).map((img, i) => (
                            <img key={i} src={`https://res.cloudinary.com/dyu8lsstq/image/upload/c_thumb,w_40,h_40/${img}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                          ))}
                        </div>
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-300 italic">None</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => { setSelectedApp(app); setShowDetail(true); }} className="hover:!bg-gray-100">
                        <VisibilityOutlinedIcon fontSize="small" className="text-gray-400" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Build Carousel">
                      <IconButton 
                        onClick={() => { setSelectedApp(app); setTempCarousel(app.carouselImages || []); setShowCarouselBuilder(true); }} 
                        className="hover:!bg-amber-50"
                      >
                        <ViewCarouselOutlinedIcon fontSize="small" className="text-amber-600" />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      onClick={() => setConfirmDelete({ open: true, id: app._id })}
                      className="hover:!bg-red-50"
                    >
                      <DeleteOutlineIcon fontSize="small" className="text-red-400" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} maxWidth="sm" fullWidth PaperProps={{ className: "!rounded-2xl" }}>
        {selectedApp && (
          <>
            <DialogTitle className="!font-bold !text-xl border-b border-gray-100 flex justify-between items-center">
              Application Detail
              <Chip label={selectedApp.status} size="small" style={{ backgroundColor: statusColors[selectedApp.status].bg, color: statusColors[selectedApp.status].text }} />
            </DialogTitle>
            <DialogContent className="!py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Customer Name</label>
                  <p className="font-medium text-gray-900">{selectedApp.name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Date Received</label>
                  <p className="font-medium text-gray-900">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Email</label>
                  <p className="font-medium text-gray-900">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Phone</label>
                  <p className="font-medium text-gray-900">{selectedApp.phone || "Not provided"}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-1">Message</label>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 text-sm whitespace-pre-wrap italic">
                  "{selectedApp.message}"
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-3">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(statusColors).map(status => (
                    <Button 
                      key={status}
                      onClick={() => setConfirmStatus({ open: true, id: selectedApp._id, status })}
                      variant={selectedApp.status === status ? "contained" : "outlined"}
                      size="small"
                      style={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '12px',
                        boxShadow: 'none',
                        backgroundColor: selectedApp.status === status ? statusColors[status].text : 'transparent',
                        borderColor: selectedApp.status === status ? statusColors[status].text : '#e5e1da',
                        color: selectedApp.status === status ? '#fff' : '#6b7280',
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
            <DialogActions className="!p-4 bg-gray-50/50">
              <Button onClick={() => setShowDetail(false)} className="!text-gray-500 !normal-case !font-semibold">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Carousel Builder Dialog */}
      <Dialog open={showCarouselBuilder} onClose={() => setShowCarouselBuilder(false)} maxWidth="md" fullWidth PaperProps={{ className: "!rounded-3xl" }}>
        <DialogTitle className="!font-bold !text-xl">Build Image Carousel</DialogTitle>
        <DialogContent className="!pt-2">
          <Typography variant="body2" className="text-gray-500 mb-6">
            Select images from the gallery to display in the user's customized moodboard/carousel.
          </Typography>
          
          <div className="mb-6 p-4 bg-navy text-white rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ViewCarouselOutlinedIcon style={{ color: "#c9a96e" }} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Selected Photos</p>
                <p className="text-sm font-medium">{tempCarousel.length} images picked</p>
              </div>
            </div>
            <div className="flex -space-x-2">
              {tempCarousel.slice(0, 5).map((img, i) => (
                <img key={i} src={`https://res.cloudinary.com/dyu8lsstq/image/upload/c_thumb,w_60,h_60/${img}`} className="w-10 h-10 rounded-full border-2 border-navy object-cover" alt="" />
              ))}
            </div>
          </div>

          <Grid container spacing={2} className="max-h-[400px] overflow-y-auto px-1">
            {gallery.map((img) => {
              const selected = tempCarousel.includes(img.publicId);
              return (
                <Grid item xs={6} sm={4} md={3} key={img._id}>
                  <div 
                    onClick={() => toggleGalleryImage(img.publicId)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden aspect-square border-4 transition-all ${selected ? 'border-gold shadow-lg scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img 
                      src={`https://res.cloudinary.com/dyu8lsstq/image/upload/c_fill,w_300,h_300/${img.publicId}`} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                    {selected && (
                      <div className="absolute top-2 right-2 bg-gold text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                        {tempCarousel.indexOf(img.publicId) + 1}
                      </div>
                    )}
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions className="!p-6">
          <Button onClick={() => setShowCarouselBuilder(false)} className="!text-gray-500 !normal-case">Cancel</Button>
          <Button 
            onClick={saveCarousel} 
            variant="contained" 
            className="!bg-navy !text-white !rounded-xl !px-8 !py-2.5 !normal-case !font-semibold !shadow-none hover:!bg-navy-hover"
          >
            Save Carousel
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog 
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Application?"
        message="This will permanently remove this enquiry from the system."
        danger
      />

      <ConfirmDialog 
        open={confirmStatus.open} 
        onClose={() => setConfirmStatus({ open: false, id: null, status: null })} 
        onConfirm={updateStatus}
        title="Update Status?"
        message={`Are you sure you want to change the status to ${confirmStatus.status}?`}
      />
    </AdminLayout>
  );
};

export default Applications;
