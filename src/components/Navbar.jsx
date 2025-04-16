import { AppBar, Toolbar, Typography } from "@mui/material";

export const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#3f51b5" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            margin: "auto",
          }}
        >
          Assign BOM Structure to Specific Orgs
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
