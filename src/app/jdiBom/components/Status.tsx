import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  Grid,
  TextField,
} from "@mui/material";

type BomStatus = {
  id: string;
  name: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  timestamp: string;
};

const mockData: BomStatus[] = [
  {
    id: "BOM-001",
    name: "98485",
    status: "Completed",
    timestamp: "2025-05-15T10:20:00Z",
  },
  {
    id: "BOM-002",
    name: "P-98460",
    status: "Processing",
    timestamp: "2025-05-14T13:40:00Z",
  },
  {
    id: "BOM-003",
    name: "EnggMFGPart187",
    status: "Failed",
    timestamp: "2025-05-13T08:15:00Z",
  },
];

const getStatusColor = (status: BomStatus["status"]) => {
  switch (status) {
    case "Pending":
      return "warning";
    case "Processing":
      return "info";
    case "Completed":
      return "success";
    case "Failed":
      return "error";
    default:
      return "default";
  }
};

export function BomCommoningStatusPage() {
  const [search, setSearch] = useState("");

  const filteredData = mockData.filter((bom) =>
    bom.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 4 }}>
      <Typography variant="h4" gutterBottom>
        BOM Commoning Status
      </Typography>

      <TextField
        label="Search BOM"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Grid container spacing={2}>
        {filteredData.map((bom) => (
          <Grid size={{ xs: 12, md: 6 }} key={bom.id}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">{bom.name}</Typography>
                  <Chip label={bom.status} color={getStatusColor(bom.status)} />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Submitted: {new Date(bom.timestamp).toLocaleString()}
                </Typography>

                <Box display="flex" gap={1} mt={2}>
                  <Button variant="outlined" size="small">
                    View
                  </Button>
                  {bom.status === "Failed" && (
                    <Button variant="contained" size="small" color="error">
                      Retry
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
