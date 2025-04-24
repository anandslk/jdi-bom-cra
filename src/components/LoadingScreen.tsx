import { Box, LinearProgress, Paper, Typography } from "@mui/material";

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <Paper
      sx={{
        padding: 4,
        width: "100%",
        maxWidth: 600,
        borderRadius: 4,
        boxShadow: 3,
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        border: "2px solid #3f51b5",
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {message}
        </Typography>
      </Box>
      <LinearProgress color="primary" />
    </Paper>
  );
};
