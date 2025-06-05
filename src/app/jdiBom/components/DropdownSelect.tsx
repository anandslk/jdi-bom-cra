import {
  Chip,
  Box,
  Paper,
  Typography,
  InputLabel,
  // AutocompleteRenderOptionState,
} from "@mui/material";
import { IFormErrors, IFormState } from "src/app/jdiBom/pages";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { FC } from "react";

export const DropdownMultiSelect: FC<DropdownProps> = ({
  selectedItems,
  onChangePlants,
  handleChange,
  rdoList = [],
  jdiList = [],
}) => {
  const handleDelete = (item: string) => {
    const updated = selectedItems.filter((i) => i !== item);
    onChangePlants(updated);
    if (rdoList.includes(item)) {
      handleChange("rdo", "");
    }
    if (jdiList.includes(item)) {
      // Update jdi to remaining JDI selections
      const remainingJdi = updated.filter((i) => jdiList.includes(i));
      handleChange("jdi", remainingJdi.join(", "));
    }
    handleChange("plants", updated);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <InputLabel
        sx={{
          fontWeight: "bold",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          marginBottom: 1,
        }}
      >
        Destination Orgs
        <RemoveCircleOutlineIcon
          sx={{
            color: !selectedItems.length ? "gray" : "red",
            marginLeft: 1,
            fontSize: 22,
            cursor: "pointer",
          }}
          onClick={() => onChangePlants([])}
        />
      </InputLabel>

      <Paper
        sx={{
          paddingY: 1,
          paddingLeft: 2,
          borderRadius: 2,
          boxShadow: 2,
          height: 200,
          display: "flex",

          ...(!!!selectedItems.length && {
            justifyContent: "center",
          }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,

            height: 180,
            overflowY: "auto",

            ...(!!!selectedItems.length && {
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }),
          }}
        >
          {!!!selectedItems.length && (
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 18,
              }}
            >
              No Items Selected
            </Typography>
          )}
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
    value: IFormState[keyof IFormState],
  ) => void;
  disabled: boolean;
  rdoList: string[];
  jdiList: string[];
  errors: IFormErrors;
}
