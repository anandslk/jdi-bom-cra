import { Box, Chip, Stack, Typography } from "@mui/material";


export const ConfirmationScreen = ({
  parentParts,
  sourceOrg,
  selectedItems,
}) => {
  return (
    <>
      {/* <Paper
      sx={{
        padding: 4,
        width: "100%",
        maxWidth: 600,
        borderRadius: 4,
        boxShadow: 3,
        opacity: stage === "assigning" ? 0.6 : 1,
      }}
    >
      <Stack spacing={3}>
      <Typography
      variant="h5"
      sx={{ fontWeight: "bold", textAlign: "center" }}
      >
      Confirm Your Submission
        </Typography> */}

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Parent item(s) to Assign:
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginBottom: 2, whiteSpace: "pre-line" }}
          >
            {parentParts}
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

        {/* <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            Destination JDI Orgs:
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {destOrg}
          </Typography>
        </Box> */}

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
        {/* <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
              Mapped Items:
            </Typography>
            {selectedItems.length > 0 ? (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: 1 }}l
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
          </Box> */}
        {/* <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={isLoading}
          >
            Confirm
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </Stack> */}
      </Stack>
      {/* </Stack>
    </Paper> */}
    </>
  );
};
