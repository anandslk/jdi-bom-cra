import { Box, Chip, Stack, Typography } from "@mui/material";

interface ConfirmationScreenProps {
  parentPart: string;
  sourceOrg: string;
  selectedItems: string[];
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  parentPart,
  sourceOrg,
  selectedItems,
}) => {
  return (
    <>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Parent item(s) to Assign:
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
            Items to be Processed:
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
      </Stack>
    </>
  );
};
