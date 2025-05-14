import {
  Chip,
  Box,
  Paper,
  Typography,
  InputLabel,
  IconButton,
  // AutocompleteRenderOptionState,
} from "@mui/material";
import { IFormErrors, IFormState } from "src/app/jdiBom/pages";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

export const DropdownMultiSelect: React.FC<DropdownProps> = ({
  selectedItems,
  onChangePlants,
  handleChange,
  rdoList = [],
  jdiList = [],
}) => {
  // track last selected index for shift-click range selection
  // const lastSelectedIndex = useRef<number | null>(null);

  // Handler for RDO (single-select)
  // const handleRdoSelect = (newValue: string | null) => {
  //   const noRdo = selectedItems.filter((item) => !rdoList.includes(item));
  //   if (newValue) {
  //     const updated = [...noRdo, newValue];
  //     onChangePlants(updated);
  //     handleChange("rdo", newValue);
  //     handleChange("plants", updated);
  //   } else {
  //     onChangePlants(noRdo);
  //     handleChange("rdo", "");
  //     handleChange("plants", noRdo);
  //   }
  // };

  // Handler for JDI (multi-select) with shift-select
  // const handleOrgSelect = (event: React.SyntheticEvent, option: string) => {
  //   let newSelected = [...selectedItems.filter((i) => !jdiList.includes(i))];
  //   const idx = jdiList.indexOf(option);

  //   if ((event as any).shiftKey && lastSelectedIndex.current != null) {
  //     // range select between last and current
  //     const [start, end] = [lastSelectedIndex.current, idx].sort(
  //       (a, b) => a - b
  //     );
  //     const range = jdiList.slice(start, end + 1);
  //     newSelected = [...newSelected, ...range];
  //   } else if (selectedItems.includes(option)) {
  //     // remove if already selected (toggle)
  //     newSelected = newSelected.filter((i) => i !== option);
  //   } else {
  //     // simple add
  //     newSelected.push(option);
  //   }

  //   lastSelectedIndex.current = idx;
  //   onChangePlants(newSelected);
  //   // Update formState.jdi with the remaining JDI selections
  //   const remainingJdi = newSelected.filter((i) => jdiList.includes(i));
  //   handleChange("jdi", remainingJdi.join(", "));
  //   handleChange("plants", newSelected);
  // };

  // Ctrl+A to select all JDI options
  // const handleOrgKeyDown = (event: React.KeyboardEvent) => {
  //   if (event.ctrlKey && event.key.toLowerCase() === "a") {
  //     event.preventDefault();
  //     const all = [
  //       ...selectedItems.filter((i) => !jdiList.includes(i)),
  //       ...jdiList,
  //     ];
  //     onChangePlants(all);
  //     handleChange("jdi", jdiList.join(", "));
  //     handleChange("plants", all);
  //   }
  // };

  // Remove chips
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

  // const selectedRdo =
  //   selectedItems.find((item) => rdoList.includes(item)) || null;
  // const selectedOrgs = selectedItems.filter((item) => jdiList.includes(item));

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* JDI multi-select with shift-select & ctrl+A */}
      {/* <InputLabel
        sx={{
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: "-15px !important",
        }}
      >
        Destination ORGS
      </InputLabel>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={jdiList}
        value={selectedOrgs}
        onChange={(_, newSelected: string[], _reason, details) => {
          const others = selectedItems.filter((i) => !jdiList.includes(i));
          const updated = [...others, ...newSelected];
          onChangePlants(updated);

          handleChange("jdi", newSelected.join(", "));
          handleChange("plants", updated);

          if (details?.option) {
            const idx = jdiList.indexOf(details.option);
            lastSelectedIndex.current = idx;
          }
        }}
        onKeyDown={handleOrgKeyDown}
        renderValue={(value, getTagProps) => {
          return (
            <Box
              sx={{
                maxHeight: 100,
                overflowY: "auto",
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                paddingRight: 1,
              }}
            >
              {value.map((option, index) => (
                <Chip
                  // key={index}
                  label={option}
                  {...getTagProps({ index })}
                  onDelete={() => handleDelete(option)}
                />
              ))}
            </Box>
          );
        }}
        // fallback to the default list items
        // renderOption={(props, option, state) => (
        //   <li {...props}>
        //     <span style={{ marginRight: 8 }}>
        //       {state.selected ? "☑️" : "⬜️"}
        //     </span>
        //     {option}
        //   </li>
        // )}
        renderInput={(params) => (
          <TextField
            {...params}
            required
            fullWidth
            variant="outlined"
            // placeholder="Destination ORGS"
            error={!!errors.jdi}
            helperText={errors.jdi}
            disabled={disabled}
          />
        )}
        // sx={{ marginTop: "5px !important" }}
        sx={{
          "& .MuiAutocomplete-tag": {
            maxWidth: "100%",
          },
          "& .MuiOutlinedInput-root": {
            maxHeight: `400px !important`,
          },
          "& .MuiAutocomplete-endAdornment": {
            maxHeight: `400px !important`,
            alignSelf: "flex-start",
          },
        }}
      /> */}

      {/* <Typography variant="caption" color="textSecondary" sx={{ fontSize: 14 }}>
        You can Shift-click to select a range, Ctrl-click to toggle individual
        items, or Ctrl +A to select all.
      </Typography> */}

      <InputLabel
        sx={{
          fontWeight: "bold",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
        }}
      >
        Destination Orgs
        <IconButton
          disabled={!selectedItems.length}
          onClick={() => onChangePlants([])}
        >
          <RemoveCircleOutlineIcon
            sx={{
              color: !selectedItems.length ? "gray" : "red",
              marginLeft: 1,
              fontSize: 22,
            }}
          />
        </IconButton>
      </InputLabel>

      <Paper
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 2,
          height: 200,
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            minHeight: 20,

            ...(!!!selectedItems.length && {
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }),
          }}
        >
          {!!!selectedItems.length && (
            <Typography
              sx={{ fontWeight: "bold", textAlign: "center", fontSize: 18 }}
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
