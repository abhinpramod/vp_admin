import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

/**
 * Reusable styled confirmation dialog.
 * Props:
 *   open       – boolean
 *   onClose    – fn (cancel)
 *   onConfirm  – fn (proceed)
 *   title      – string
 *   message    – string
 *   danger     – boolean (red confirm button)
 *   confirmLabel – string (default "Confirm")
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  danger = false,
  confirmLabel = "Confirm",
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      style: {
        borderRadius: "16px",
        padding: "8px",
        fontFamily: "Inter, sans-serif",
      },
    }}
  >
    <DialogTitle
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        paddingBottom: "4px",
        fontWeight: 600,
        fontSize: "1rem",
        color: "#1a1a2e",
      }}
    >
      <WarningAmberRoundedIcon
        style={{ color: danger ? "#dc2626" : "#d97706", fontSize: "22px" }}
      />
      {title}
    </DialogTitle>
    <DialogContent style={{ paddingTop: "8px" }}>
      <Typography
        variant="body2"
        style={{ color: "#6b7280", lineHeight: 1.6 }}
      >
        {message}
      </Typography>
    </DialogContent>
    <DialogActions style={{ padding: "12px 20px", gap: "8px" }}>
      <Button
        onClick={onClose}
        variant="outlined"
        size="small"
        style={{
          borderColor: "#e5e1da",
          color: "#6b7280",
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        variant="contained"
        size="small"
        style={{
          backgroundColor: danger ? "#dc2626" : "#0f1b2d",
          color: "#fff",
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
