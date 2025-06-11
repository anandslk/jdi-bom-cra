import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { route } from "../constants";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#3f51b5", marginBottom: 2 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
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
  );
};
