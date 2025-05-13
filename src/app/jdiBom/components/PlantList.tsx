import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export function PlantListPage() {
  const [plants, setPlants] = useState<any>([
    {
      // id: 1,
      name: "Plant A",
      //  location: 'Location 1'
    },
    {
      // id: 2,
      name: "Plant B",
      //  location: 'Location 2'
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPlant, setCurrentPlant] = useState({
    id: null,
    name: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenDialog = (plant = { id: null, name: "", location: "" }) => {
    setIsEditing(!!plant.id);
    setCurrentPlant(plant);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentPlant({ id: null, name: "", location: "" });
  };

  const handleChange = (e: any) => {
    setCurrentPlant({ ...currentPlant, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (isEditing) {
      setPlants(
        plants.map((p: any) => (p.id === currentPlant.id ? currentPlant : p)),
      );
    } else {
      const newPlant = { ...currentPlant, id: Date.now() };
      setPlants([...plants, newPlant]);
    }
    handleCloseDialog();
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Typography variant="h4">Plant List</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Plant
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell><strong>ID</strong></TableCell> */}
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              {/* <TableCell><strong>Location</strong></TableCell> */}
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plants.map((plant: any) => (
              <TableRow key={plant.id}>
                {/* <TableCell>{plant.id}</TableCell> */}
                <TableCell>{plant.name}</TableCell>
                {/* <TableCell>{plant.location}</TableCell> */}
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleOpenDialog(plant)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {plants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No plants available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? "Edit Plant" : "Add New Plant"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Plant Name"
            name="name"
            fullWidth
            value={currentPlant.name}
            onChange={handleChange}
          />
          {/* <TextField
            margin="dense"
            label="Location"
            name="location"
            fullWidth
            value={currentPlant.location}
            onChange={handleChange}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
