import { Box, Typography, Container } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export function NotAuthorizedPage() {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <WarningAmberIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Not Authorized
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          You are not authorized to perform BOM Commoning. Please contact your
          administrator for access.
        </Typography>
        <Typography
          color="primary"
          onClick={() => (window.location.href = "mailto:admin@example.com")}
        >
          Contact Administrator
        </Typography>
        {/* <Button variant="contained" color="primary" onClick={() => window.location.href = 'mailto:admin@example.com'}>
          Contact Administrator
        </Button> */}
      </Box>
    </Container>
  );
}
