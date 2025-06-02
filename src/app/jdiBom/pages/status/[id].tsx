import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Stack,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useGetJdiBomQuery } from "../../slices/apis/jdiBom.api";
import { route } from "../../constants";
import { getStatusColor, Status } from ".";

export default function BomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: item,
    isLoading,
    isError,
  } = useGetJdiBomQuery({ id: id! }, { skip: !id });

  if (isError) {
    return <Typography color="error">Error loading BOM details</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      <Button
        variant="outlined"
        startIcon={<HomeIcon />}
        onClick={() => navigate(route.index)}
        sx={{ mb: 3 }}
      >
        Back to List
      </Button>

      {isLoading ? (
        <CircularProgress />
      ) : (
        item && (
          <Stack spacing={2}>
            <Typography variant="h4" gutterBottom>
              BOM Details
            </Typography>

            <Typography variant="h6">Request ID: {item.data.id}</Typography>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1">Source Org:</Typography>
                <Typography>{item.data.sourceOrg}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">Processed Items:</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {item.data.processedItems.map((p, idx) => (
                    <Chip key={idx} label={p.Title} />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1">Target Orgs:</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {item.data.targetOrgs.map((org, idx) => (
                    <Chip key={idx} label={org} variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1">Status:</Typography>
                <Chip
                  label={item.data.status}
                  color={getStatusColor(item.data.status as Status)}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1">Submitted:</Typography>
                <Typography>
                  {new Date(item.data.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        )
      )}
    </Box>
  );
}
