import { useState } from "react";
import { TextField, Box, Paper, Button, Stack, Alert } from "@mui/material";
import { ConfirmationScreen } from "../components/Confirmation";
import { ResultsScreen } from "../components/Result";
import { Dialog } from "../components/Dialog";
import { useConfirmations } from "../hooks/useConfirmations";
import { usePostMutation } from "../slices/apis/app.api";
import toast from "react-hot-toast";
import { getErrorMessage } from "../slices/apis/types";
import { DropdownMultiSelect } from "../components/DropdownSelect";

export const JdiBomPage = () => {
  // Form fields and error state
  const [errors, setErrors] = useState({});

  const [formState, setFormState] = useState({
    parentParts: "",
    sourceOrg: "",
    plants: [],
  });

  const handleChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const { isOpen, setIsOpen } = useConfirmations();

  // --- Form Submission ---
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formState.parentParts.trim())
      newErrors.parentParts = "Parent Part is required";
    if (!formState.sourceOrg.trim())
      newErrors.sourceOrg = "Source org is required";
    if (!formState.plants.length)
      newErrors.plants = "Select either RDO Name or Destination JDI Org";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) setIsOpen(true);
  };

  // --- Cancel Handler ---
  const handleCancel = () => setIsOpen(false);

  const [postMutation, { isLoading }] = usePostMutation();

  // --- Confirmation Stage ---
  const handleConfirmationSubmit = async () => {
    const { data, error } = await postMutation({
      parentPart: formState.parentParts,
      sourceOrg: formState.sourceOrg,
      plants: formState.plants,
    });

    if (error) toast.error(getErrorMessage(error));

    setIsOpen(false);
    toast.success(data.message);
    // setTimeout(() => navigate("/tasks"), 500);
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 65px)", backgroundColor: "#eef2f6" }}>
      <Dialog
        isOpen={isOpen}
        title="Confirm Your Submission"
        onSubmit={handleConfirmationSubmit}
        onCancel={handleCancel}
        disabled={isLoading}
      >
        <ConfirmationScreen
          parentParts={formState.parentParts}
          sourceOrg={formState.sourceOrg}
          selectedItems={formState.plants}
        />
      </Dialog>

      <Box
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          minHeight: "calc(100vh - 200px)",
        }}
      >
        <Paper
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: 600,
            borderRadius: 4,
            boxShadow: 3,
          }}
        >
          <form onSubmit={handleFormSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Parent item(s) to Assign"
                variant="outlined"
                value={formState.parentParts}
                onChange={(e) => handleChange("parentParts", e.target.value)}
                error={!!errors.parentParts}
                helperText={errors.parentParts}
                fullWidth
              />
              <TextField
                label="Source Organization"
                variant="outlined"
                value={formState.sourceOrg}
                onChange={(e) => handleChange("sourceOrg", e.target.value)}
                error={!!errors.sourceOrg}
                helperText={errors.sourceOrg}
                fullWidth
              />

              <DropdownMultiSelect
                selectedItems={formState.plants}
                onChange={(newSelectedItems) =>
                  handleChange("plants", newSelectedItems)
                }
                disabled={false}
              />

              {errors.plants && <Alert severity="error">{errors.plants}</Alert>}

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>

        {/* <LoadingScreen message="Assigning items and commoning required parts..." /> */}

        {/* Results Screen */}
        {false && (
          <ResultsScreen
            parentParts={formState.parentParts}
            sourceOrg={formState.sourceOrg}
            selectedItems={formState.plants}
            onBack={handleCancel}
          />
        )}
      </Box>
    </Box>
  );
};

export default JdiBomPage;
