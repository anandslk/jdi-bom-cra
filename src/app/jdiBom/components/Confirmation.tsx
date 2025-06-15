import { Box, Chip, Stack, Typography } from "@mui/material";
import { FC } from "react";

interface ConfirmationScreenProps {
  parentParts: string[];
  sourceOrg: string;
  selectedItems: string[];
}

export const ConfirmationScreen: FC<ConfirmationScreenProps> = ({
  parentParts,
  sourceOrg,
  selectedItems,
}) => {
  return (
    <Stack spacing={2} sx={{ paddingY: 2 }}>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", fontSize: 17 }}
        >
          Parent item(s) to Assign:
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: 2, whiteSpace: "pre-line" }}
        >
          {parentParts?.length > 0 ? (
            <Box
              sx={{
                maxHeight: 129,
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                padding: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                marginTop: 1,
              }}
            >
              {parentParts?.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  color="primary"
                  sx={{ fontSize: 13 }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No items selected.
            </Typography>
          )}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", fontSize: 17 }}
        >
          Source Organization:
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2, fontSize: 15 }}>
          {sourceOrg}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", fontSize: 17 }}
        >
          Items to be Processed:
        </Typography>
        {selectedItems?.length > 0 ? (
          <Box
            sx={{
              maxHeight: 170,
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              padding: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              marginTop: 1,
            }}
          >
            {selectedItems?.map((item) => (
              <Chip
                key={item}
                label={item}
                color="primary"
                sx={{ fontSize: 13 }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No items selected.
          </Typography>
        )}
      </Box>
    </Stack>
  );
};
