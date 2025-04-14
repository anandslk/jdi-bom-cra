import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useOrgListQuery, useRdoListQuery } from "../slices/apis/app.api";

export const DropdownMultiSelect = ({
  selectedItems,
  onChange,
  disabled,
}) => {
  const handleSelect = (newValue) => {
    if (newValue && !selectedItems?.includes(newValue)) {
      onChange([...selectedItems, newValue]);
    }
  };

  const handleDelete = (itemToDelete) => {
    onChange(selectedItems?.filter((item) => item !== itemToDelete));
  };

  const { data: rdoList } = useRdoListQuery({});
  const { data: orgList } = useOrgListQuery({});

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Autocomplete
        options={rdoList?.data ?? []}
        onChange={(_, newValue) => handleSelect(newValue )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="RDO Name (will appear in Selected Plants)"
            fullWidth
            variant="outlined"
            disabled={disabled}
          />
        )}
      />
      <Autocomplete
        options={orgList?.data ?? []}
        onChange={(_, newValue) => handleSelect(newValue )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Destination JDI Orgs (will appear in Selected Plants)"
            fullWidth
            variant="outlined"
            disabled={disabled}
          />
        )}
      />

      {/* Helper text indicating both selections will be shown */}
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
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", marginBottom: 2 }}
        >
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
