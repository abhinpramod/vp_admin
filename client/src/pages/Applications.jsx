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
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";

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
      <Dialog 
        open={showDetail} 
        onClose={() => setShowDetail(false)} 
        maxWidth="sm" 
        fullWidth 
        fullScreen={isMobile}
        PaperProps={{ 
          className: isMobile ? "" : "!rounded-[2rem] !shadow-2xl !border !border-gray-100",
          style: { background: "#fff" }
        }}
      >
        {selectedApp && (
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
            
            <DialogTitle className={`!font-black ${isMobile ? '!text-xl !pt-8 !px-6' : '!text-2xl !pt-10 !px-8'} flex justify-between items-center bg-white border-b border-gray-50`}>
              <div className="flex flex-col">
                <span className="text-navy tracking-tight caps">Enquiry Detail</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mt-1">Submission Analysis</span>
              </div>
              <IconButton 
                onClick={() => setShowDetail(false)} 
                size="small" 
                className="!bg-gray-50 hover:!bg-gray-100 !text-gray-400"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent className={`${isMobile ? '!px-6 !py-6' : '!px-8 !py-8'} space-y-8`}>
              <Box className="flex justify-between items-center bg-navy/5 p-5 rounded-3xl border border-navy/10">
                <Box>
                  <Typography variant="subtitle2" fontWeight="800" className="text-navy leading-tight">Status Trace</Typography>
                  <Typography variant="caption" className="text-gray-500 font-medium">Current lifecycle stage</Typography>
                </Box>
                <Chip 
                  label={selectedApp.status} 
                  size="small" 
                  style={{ 
                    backgroundColor: statusColors[selectedApp.status].bg, 
                    color: statusColors[selectedApp.status].text,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }} 
                />
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <label className="text-[10px] uppercase font-black text-navy/40 tracking-widest block mb-2">Customer Name</label>
                  <p className="font-black text-navy text-lg">{selectedApp.name}</p>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <label className="text-[10px] uppercase font-black text-navy/40 tracking-widest block mb-2">Submission Date</label>
                  <p className="font-bold text-gray-700">{new Date(selectedApp.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <label className="text-[10px] uppercase font-black text-navy/40 tracking-widest block mb-2">Direct Email</label>
                  <p className="font-bold text-gray-700">{selectedApp.email}</p>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <label className="text-[10px] uppercase font-black text-navy/40 tracking-widest block mb-2">Phone Contact</label>
                  <p className="font-bold text-gray-700">{selectedApp.phone || "Not provided"}</p>
                </Grid>
              </Grid>

              <Box>
                <label className="text-[10px] uppercase font-black text-navy/40 tracking-widest block mb-3">User Message</label>
                <div className="bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100 text-gray-700 text-sm leading-relaxed italic">
                  "{selectedApp.message}"
                </div>
              </Box>

              <Box>
                <label className="text-[10px] uppercase font-black text-navy/40 tracking-widest block mb-4">Advance Workflow Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(statusColors).map(status => (
                    <Button 
                      key={status}
                      onClick={() => setConfirmStatus({ open: true, id: selectedApp._id, status })}
                      variant={selectedApp.status === status ? "contained" : "outlined"}
                      size="small"
                      className={`!rounded-xl !py-2.5 !text-[10px] !font-black !uppercase !tracking-widest ${selectedApp.status === status ? '!shadow-lg !shadow-navy/20' : ''}`}
                      style={{ 
                        backgroundColor: selectedApp.status === status ? statusColors[status].text : 'transparent',
                        borderColor: selectedApp.status === status ? statusColors[status].text : '#eee',
                        color: selectedApp.status === status ? '#fff' : '#9ea7b4',
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </Box>
            </DialogContent>
            
            <DialogActions className={`${isMobile ? '!px-6 !pb-10' : '!px-8 !pb-10'} !pt-4`}>
              <Button onClick={() => setShowDetail(false)} fullWidth className="!bg-gray-50 hover:!bg-gray-100 !text-gray-400 !normal-case !font-black !py-4 !rounded-2xl transition-all">
                Close Detail View
              </Button>
            </DialogActions>
          </div>
        )}
      </Dialog>

      {/* Carousel Builder Dialog */}
      <Dialog 
        open={showCarouselBuilder} 
        onClose={() => setShowCarouselBuilder(false)} 
        maxWidth="md" 
        fullWidth 
        fullScreen={isMobile}
        PaperProps={{ 
          className: isMobile ? "" : "!rounded-[2rem] !shadow-2xl !border !border-gray-100",
          style: { background: "#fff" }
        }}
      >
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          
          <DialogTitle className={`!font-black ${isMobile ? '!text-xl !pt-8 !px-6' : '!text-2xl !pt-10 !px-8'} flex justify-between items-center bg-white border-b border-gray-50`}>
             <div className="flex flex-col">
              <span className="text-navy tracking-tight">Moodboard Builder</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mt-1">Custom Carousel Engineering</span>
            </div>
            <IconButton 
              onClick={() => setShowCarouselBuilder(false)} 
              size="small" 
              className="!bg-gray-50 hover:!bg-gray-100 !text-gray-400"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent className={`${isMobile ? '!px-6 !py-6' : '!px-8 !py-8'} space-y-8`}>
            <Box className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-navy text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-xl" />
              <Box className="flex items-center gap-4 flex-1">
                <Box className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                  <ViewCarouselOutlinedIcon style={{ color: "#c9a96e" }} />
                </Box>
                <div>
                  <Typography variant="overline" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-0.5">Configuration Engine</Typography>
                  <Typography variant="subtitle1" fontWeight="800">{tempCarousel.length} Visual Assets Selected</Typography>
                </div>
              </Box>
              <Box className="flex -space-x-3">
                {tempCarousel.slice(0, 5).map((img, i) => (
                  <img key={i} src={`https://res.cloudinary.com/dyu8lsstq/image/upload/c_thumb,w_80,h_80/${img}`} className="w-10 h-10 rounded-full border-2 border-navy object-cover shadow-2xl transition-all hover:scale-110 hover:z-10" alt="" />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="overline" className="text-[10px] font-black text-navy/40 uppercase tracking-[0.15em] mb-4 block px-2">Gallery Asset Library</Typography>
              <Grid container spacing={2} className={`${isMobile ? 'max-h-[50vh]' : 'max-h-[400px]'} overflow-y-auto px-1 scrollbar-hide`}>
                {gallery.map((img) => {
                  const selected = tempCarousel.includes(img.publicId);
                  return (
                    <Grid item xs={6} sm={4} md={3} key={img._id}>
                      <div 
                        onClick={() => toggleGalleryImage(img.publicId)}
                        className={`relative cursor-pointer rounded-2xl overflow-hidden aspect-square border-4 transition-all duration-300 ${selected ? 'border-gold shadow-2xl scale-95' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}
                      >
                        <img 
                          src={`https://res.cloudinary.com/dyu8lsstq/image/upload/c_fill,w_300,h_300,q_auto/${img.publicId}`} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                        {selected && (
                          <div className="absolute top-2 right-2 bg-gold text-white rounded-full w-7 h-7 flex items-center justify-center font-black text-[11px] shadow-lg ring-2 ring-white">
                            {tempCarousel.indexOf(img.publicId) + 1}
                          </div>
                        )}
                        {selected && <div className="absolute inset-0 bg-gold/10 pointer-events-none" />}
                      </div>
                    </Grid>
                  );
                })}
                {gallery.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold italic uppercase text-[10px] tracking-widest">No published gallery items found.</div>}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions className={`${isMobile ? '!px-6 !pb-10' : '!px-8 !pb-10'} !pt-4 flex flex-col sm:flex-row gap-3`}>
            <Button 
              onClick={saveCarousel} 
              variant="contained" 
              fullWidth
              className="!bg-navy hover:!bg-navy-hover !text-white !rounded-2xl !py-4 !shadow-xl !shadow-navy/20 !normal-case !font-black !text-base transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Deploy Moodboard
            </Button>
            <Button onClick={() => setShowCarouselBuilder(false)} fullWidth className="!text-gray-400 !normal-case !font-black !py-2 hover:!bg-gray-50 !rounded-xl transition-all">
              Cancel
            </Button>
          </DialogActions>
        </div>
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
