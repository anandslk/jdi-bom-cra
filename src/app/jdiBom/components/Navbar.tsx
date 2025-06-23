import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { route } from "../constants";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";

export const Navbar = () => {
  const navigate = useNavigate();

  const selectedCS = window?.widget?.getValue("Credentials");

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#3f51b5", marginBottom: 2 }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              component="div"
              sx={{
                fontSize: 20,
                textAlign: "center",
                margin: "auto",
                flex: 1,
              }}
            >
              Assign BOM Structure to Specific Orgs
            </Typography>

            <Tooltip
              title={
                selectedCS ? `Selected CS: ${selectedCS}` : "No CS Selected"
              }
              arrow
              slotProps={{ tooltip: { sx: { fontSize: "14px" } } }}
            >
              <SettingsApplicationsIcon
                sx={{ fontSize: 26, cursor: "pointer" }}
              />
            </Tooltip>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            sx={{ marginLeft: "auto", fontSize: 12 }}
            onClick={() => navigate(route.status)}
          >
            Check BOM Status
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};
