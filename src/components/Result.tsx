import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";

interface ResultsScreenProps {
  parentPart: string;
  sourceOrg: string;
  selectedItems: string[];
  onBack: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  parentPart,
  sourceOrg,
  selectedItems,
  onBack,
}) => {
  return (
    <Paper
      sx={{
        padding: 4,
        width: "100%",
        maxWidth: 600,
        borderRadius: 4,
        boxShadow: 4,
      }}
    >
      <Stack spacing={3}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          Submitted Details
        </Typography>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Parent Parts to Assign:
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginBottom: 2, whiteSpace: "pre-line" }}
          >
            {parentPart}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Source Organization:
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {sourceOrg}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Mapped Items:
          </Typography>
          {selectedItems.length > 0 ? (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: 1 }}
            >
              {selectedItems.map((item) => (
                <Chip key={item} label={item} color="primary" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No items selected.
            </Typography>
          )}
        </Box>
        <Button variant="outlined" color="primary" onClick={onBack}>
          Back to Form
        </Button>
      </Stack>
    </Paper>
  );
};
