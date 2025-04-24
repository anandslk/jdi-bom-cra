import { Box, Container, LinearProgress } from "@mui/material";

export const LineProgress = () => (
  <Container
    sx={{
      height: "70vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flex="1 1 auto"
    >
      <LinearProgress
        sx={{
          width: 1,
          maxWidth: 320,
        }}
      />
    </Box>
  </Container>
);
