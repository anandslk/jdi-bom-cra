import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { IFormErrors, IFormState } from "src/pages/jdiBom/JdiBomPage";

export const DropdownMultiSelect: React.FC<DropdownProps> = ({
  selectedItems,
  onChangePlants,
  handleChange,
  disabled,
  rdoList = [],
  jdiList = [],
  errors,
}) => {
  // When the user picks or clears RDO:
  const handleRdoSelect = (newValue: string | null) => {
    // remove any old RDO from selectedItems
    const noRdo = selectedItems.filter((item) => !rdoList.includes(item));

    if (newValue) {
      const updated = [...noRdo, newValue];
      onChangePlants(updated);
      handleChange("rdo", newValue); // set formState.rdo
      handleChange("plants", updated); // sync plants
    } else {
      // user clicked the clear button (newValue === null)
      onChangePlants(noRdo);
      handleChange("rdo", ""); // clear formState.rdo
      handleChange("plants", noRdo); // sync plants sans RDO
    }
  };

  // When the user picks JDI Orgs:
  const handleOrgSelect = (newOrgs: string[]) => {
    // remove old JDI orgs
    const noJdi = selectedItems.filter((item) => !jdiList.includes(item));
    const updated = [...noJdi, ...newOrgs];
    onChangePlants(updated);
    handleChange("jdi", newOrgs.join(", ")); // set formState.jdi
    handleChange("plants", updated); // sync plants
  };

  // When the user deletes a chip:
  const handleDelete = (item: string) => {
    const updated = selectedItems.filter((i) => i !== item);
    onChangePlants(updated);

    // if they deleted the RDO chip, clear formState.rdo
    if (rdoList.includes(item)) {
      handleChange("rdo", "");
    }
    // if they deleted a JDI org chip, clear formState.jdi
    if (jdiList.includes(item)) {
      handleChange("jdi", "");
    }

    handleChange("plants", updated);
  };

  // Derive what to show in each Autocomplete:
  const selectedRdo =
    selectedItems.find((item) => rdoList.includes(item)) || null;

  const selectedOrgs = selectedItems.filter((item) => jdiList.includes(item));

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* RDO single-select */}
      <Autocomplete
        options={rdoList}
        value={selectedRdo}
        onChange={(_, newValue) => handleRdoSelect(newValue as string | null)}
        clearOnEscape
        renderInput={(params) => (
          <TextField
            {...params}
            required
            label="RDO Name (will appear in Selected Plants)"
            fullWidth
            variant="outlined"
            error={!!errors.rdo}
            helperText={errors.rdo}
            disabled={disabled}
          />
        )}
      />

      {/* JDI multi-select */}
      <Autocomplete
        multiple
        options={jdiList}
        value={selectedOrgs}
        onChange={(_, values) => handleOrgSelect(values as string[])}
        renderInput={(params) => (
          <TextField
            {...params}
            required
            label="Destination JDI Orgs (will appear in Selected Plants)"
            fullWidth
            variant="outlined"
            error={!!errors.jdi}
            helperText={errors.jdi}
            disabled={disabled}
          />
        )}
      />

      <Typography variant="caption" color="textSecondary">
        Selections from both fields will appear below.
      </Typography>

      <Paper
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 2,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Selected Plants
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, minHeight: 20 }}>
          {selectedItems.map((item) => (
            <Chip
              key={item}
              label={item}
              onDelete={() => handleDelete(item)}
              color="primary"
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

interface DropdownProps {
  selectedItems: string[];
  onChangePlants: (items: string[]) => void;
  handleChange: (
    key: keyof IFormState,
    value: IFormState[keyof IFormState]
  ) => void;
  disabled: boolean;
  rdoList: string[];
  jdiList: string[];
  errors: IFormErrors;
}
